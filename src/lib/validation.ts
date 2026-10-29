import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
const required = (label: string, max = 200) => z.string().trim().regex(/^[^\r\n\x00-\x1f\x7f]*$/, "Use a single line of text").min(1, `${label} is required`).max(max, `${label} is too long`);

export const VARIANTS = [
  { value: "sjb-1525", label: "SJB-1525 (25 A)" },
  { value: "sjb-1530", label: "SJB-1530 (30 A)" },
  { value: "sjb-1535", label: "SJB-1535 (35 A)" },
  { value: "custom", label: "Custom or not sure yet" },
] as const;

export const rfqSchema = z.object({
  intent: z.enum(["quotation", "specifications"]).default("quotation"),
  company: required("Company name"),
  contactName: required("Contact person", 120),
  email: z.string().trim().toLowerCase().email("Enter a valid business email").max(200),
  phone: z
    .string()
    .trim()
    .min(6, "Enter a mobile or WhatsApp number")
    .max(32)
    .regex(/^[+()\d\s.-]+$/, "Use digits, spaces and + only"),
  country: required("Country", 80),
  variant: z.enum(["sjb-1525", "sjb-1530", "sjb-1535", "custom"], { message: "Choose a product variant" }),
  currentRating: required("Current rating", 40),
  quantity: z.coerce.number({ message: "Enter a quantity" }).int("Use a whole number").min(1, "Quantity must be at least 1").max(100_000_000),
  cableLength: text(60).optional(),
  cableSection: text(60).optional(),
  connectorType: text(120).optional(),
  standard: text(160).optional(),
  deliveryLocation: required("Delivery location", 160),
  deliveryDate: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), "Enter a valid date"),
  requirements: text(5000).optional(),
  consent: z.literal("yes", { message: "Please agree to the privacy notice to continue" }),
});

export type RfqInput = z.infer<typeof rfqSchema>;

export const CONTACT_TOPICS = [
  { value: "sales", label: "Sales and customer enquiries" },
  { value: "procurement", label: "Procurement and supplier enquiries" },
  { value: "technical", label: "Engineering and technical enquiries" },
] as const;

export const contactSchema = z.object({
  topic: z.enum(["sales", "procurement", "technical"], { message: "Choose a topic" }),
  name: required("Your name", 120),
  company: text(200).optional(),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(200),
  phone: text(32).optional(),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(5000),
  consent: z.literal("yes", { message: "Please agree to the privacy notice to continue" }),
});

export function fieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = String(i.path[0] ?? "form");
    if (!out[k]) out[k] = i.message;
  }
  return out;
}
