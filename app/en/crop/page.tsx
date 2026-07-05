import type { Metadata } from "next";
import CropContent from "@/app/crop/CropContent";
import { altLanguages } from "@/lib/seo";

// English mirror of /crop.
export const metadata: Metadata = {
  title: "Smart Image Cropper — Free, Private, No Upload | Pixly",
  description:
    "Crop images online for free. Smart crop auto-finds the subject (product or person) for any aspect ratio. 100% in your browser — nothing is uploaded.",
  alternates: {
    canonical: "/en/crop/",
    languages: altLanguages("/crop/"),
  },
};

export default function EnCropPage() {
  return <CropContent />;
}
