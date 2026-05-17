import * as z from "zod";

export const passwordSchema = z
	.string()
	.min(1, { message: "Password is required" })
	.min(8, { message: "Password must be at least 8 characters" })
	.max(50)
    .refine((val) => /[A-Z]/.test(val), {
        params: { i18n: "require_capital_letter" },
    })
    .refine((val) => /[a-z]/.test(val), {
        params: { i18n: "require_lowercase_letter" },
    })
    .refine((val) => /[0-9]/.test(val), {
        params: { i18n: "require_number" },
    })
    .refine((val) => /[^A-Za-z0-9]/.test(val), {
        params: { i18n: "require_special_character" },
    });
