import { importResponseSchema, type ImportResponse } from "@groweasy/shared";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ApiErrorBody = {
  error?: {
    message?: string;
  };
};

const errorMessageFromResponse = async (response: Response) => {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return body.error?.message ?? `Request failed with ${response.status}`;
  } catch {
    return `Request failed with ${response.status}`;
  }
};

export const uploadCsvForExtraction = async (file: File): Promise<ImportResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/imports/extract`, {
      method: "POST",
      body: formData
    });
  } catch (error) {
    throw new Error(
      error instanceof Error && error.message === "Failed to fetch"
        ? `Could not reach the API at ${apiBaseUrl}. Check that the API server is running and CORS allows this browser origin.`
        : "CSV upload failed before the API returned a response."
    );
  }

  if (!response.ok) {
    throw new Error(await errorMessageFromResponse(response));
  }

  return importResponseSchema.parse(await response.json());
};
