import type { Metadata } from "next";
import CropContent from "./CropContent";

export const metadata: Metadata = {
  title: "Smart Image Cropper — Free, Private, No Upload | Pixly",
  description:
    "Crop images online for free. Smart crop auto-finds the subject (product or person) for any aspect ratio. 100% in your browser — nothing is uploaded.",
  alternates: { canonical: "/crop/" },
};

export default function CropPage() {
  return <CropContent />;
}
