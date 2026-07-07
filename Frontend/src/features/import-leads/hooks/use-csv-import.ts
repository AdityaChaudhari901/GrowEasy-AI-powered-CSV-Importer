"use client";

import { useMutation } from "@tanstack/react-query";
import { uploadCsvForExtraction } from "@/lib/api";

export const useCsvImport = () =>
  useMutation({
    mutationFn: uploadCsvForExtraction
  });
