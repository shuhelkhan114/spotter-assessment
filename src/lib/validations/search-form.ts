import * as yup from "yup";

export const searchFormSchema = yup.object({
  origin: yup.string().required("Origin is required"),
  originCode: yup
    .string()
    .required("Please select an origin airport")
    .matches(/^[A-Z]{3}$/, "Invalid airport code"),
  destination: yup.string().required("Destination is required"),
  destinationCode: yup
    .string()
    .required("Please select a destination airport")
    .matches(/^[A-Z]{3}$/, "Invalid airport code"),
  tripType: yup
    .string()
    .oneOf(["roundtrip", "oneway"] as const)
    .required(),
  departureDate: yup.date().required("Departure date is required").nullable(),
  returnDate: yup
    .date()
    .nullable()
    .when("tripType", {
      is: "roundtrip",
      then: (schema) => schema.required("Return date is required for round trip"),
      otherwise: (schema) => schema.nullable(),
    }),
  passengers: yup.object({
    adults: yup
      .number()
      .min(1, "At least 1 adult is required")
      .max(9, "Maximum 9 adults")
      .required(),
    children: yup.number().min(0).max(9).required(),
    infants: yup.number().min(0).max(9).required(),
  }),
});

export type SearchFormValues = yup.InferType<typeof searchFormSchema>;
