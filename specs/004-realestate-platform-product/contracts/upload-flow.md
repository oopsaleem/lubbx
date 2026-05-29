# Contract: Media Upload Flow (Presigned URL + Confirm)

## Purpose

Define the API contract for uploading media files to a project using S3 presigned URLs with a two-step confirmation pattern.

## Contract

### Step 1: `POST /api/projects/:projectId/media/upload-init`

Initiate an upload batch. Validates permissions, file types, sizes, and rate limits. Returns one presigned URL per file.

**Request**:
```json
{
  "files": [
    {
      "fileName": "living-room-panorama.jpg",
      "fileSize": 5242880,
      "mimeType": "image/jpeg",
      "mediaType": "panorama"
    },
    {
      "fileName": "floor-plan.pdf",
      "fileSize": 1048576,
      "mimeType": "application/pdf",
      "mediaType": "floor_plan"
    }
  ]
}
```

**Validation rules**:
- `fileSize` must be ≤ 100 MB per file (FR-023)
- `mediaType` must be one of: `panorama`, `model_3d`, `floor_plan`, `gallery_image`
- `mimeType` must match expected type per `mediaType`
- Rate limit: max 50 files per request, max 50 uploads/minute/organization (FR-024)
- Requester must have EDITOR role on the project (or be org admin)
- Project must exist and belong to requester's active organization
- Storage check: `organization.storageUsedBytes + totalFileSize ≤ organization.storageLimitBytes` (FR-016; Free plan only — Flex/Pro have no hard limit)

**Response (200)**:
```json
{
  "uploads": [
    {
      "uploadId": "upl_abc123",
      "presignedUrl": "https://s3.amazonaws.com/bucket/pano/...?X-Amz-Signature=...",
      "objectKey": "projects/proj_xxx/panoramas/uuid-image.jpg",
      "fileName": "living-room-panorama.jpg",
      "mediaType": "panorama"
    }
  ]
}
```

**Response (429 — rate limited)**:
```json
{
  "error": "rate_limit_exceeded",
  "message": "Upload limit reached. Try again later.",
  "retryAfter": 45
}
```

**Response (413 — storage limit)**:
```json
{
  "error": "storage_limit_exceeded",
  "message": "Storage limit reached. Upgrade your plan to continue uploading.",
  "upgradeUrl": "/billing"
}
```

### Step 2: Upload file to S3 via presigned URL

**Method**: `PUT` (using the returned `presignedUrl`)  
**Body**: Raw file binary  
**Content-Type**: Match the file's MIME type  
**Progress**: Tracked client-side via `XMLHttpRequest.upload.onprogress`

**Success**: HTTP 200  
**Failure cases**: HTTP 403 (expired URL), network error (retry)

### Step 3: `POST /api/projects/:projectId/media/upload-confirm`

Confirm successful S3 upload. Persists media record and updates storage usage atomically.

**Request**:
```json
{
  "uploads": [
    {
      "uploadId": "upl_abc123",
      "objectKey": "projects/proj_xxx/panoramas/uuid-image.jpg",
      "fileSize": 5242880,
      "width": 8000,
      "height": 4000
    }
  ]
}
```

**Fields**:
- `uploadId`: returned by `upload-init`
- `objectKey`: S3 object key from step 1 response (server verifies S3 object exists with `headObject`)
- `fileSize`: verified against step 1 value
- `width`/`height`: optional image dimensions (used for finalizing panorama classification based on aspect ratio; server re-checks if `mediaType === "panorama"`)

**Response (200)**:
```json
{
  "media": [
    {
      "id": "med_xxx",
      "fileName": "living-room-panorama.jpg",
      "type": "PANORAMA",
      "size": 5242880,
      "url": "/api/projects/proj_xxx/media/med_xxx/file"
    }
  ],
  "storageUsedBytes": 15728640
}
```

**Server-side processing** (within DB transaction):
1. Verify `uploadId` exists and hasn't been confirmed yet
2. Call S3 `headObject` to confirm file exists at `objectKey`
3. FINALIZE media type: re-check aspect ratio if panorama candidate
4. INSERT `MediaFile` record
5. UPDATE `Organization.storageUsedBytes += fileSize`
6. DELETE or mark `uploadId` as consumed
7. COMMIT transaction

### Error Handling

| Scenario | Response | HTTP Status |
|----------|----------|-------------|
| Expired presigned URL | `{ error: "presigned_url_expired" }` | Client retries `upload-init` to get new URL |
| S3 object not found on confirm | `{ error: "upload_not_found" }` | 400 — upload to S3 must succeed before confirm |
| Duplicate confirm | `{ error: "upload_already_confirmed" }` | 409 — idempotent, skip |
| Stale upload-init (no confirm after 30 min) | Background cleanup deletes record | — |

### Cleanup

A background cron job runs hourly to delete unconfirmed `upload-init` records older than 30 minutes (stale presigned URLs are harmless since they expire anyway, but the records should be cleaned up to avoid accumulation).
