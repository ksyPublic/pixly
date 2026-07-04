import type { Locale } from "@/lib/i18n";
import type { Faq } from "@/lib/jsonld";

// The FAQ content — the SINGLE source for both the visible page
// (app/faq/FaqContent.tsx) and the FAQPage JSON-LD (app/faq/page.tsx). The
// server builds structured data from `faqEntries("ko")` while the client
// renders the same `faqCategories(locale)`, so the schema can never drift from
// what users actually read. Tool links live OUTSIDE the answer strings, so the
// schema text stays clean plain text that mirrors the visible <p> exactly.

/** A related-tool link rendered as a chip under an answer (UI only — never part
 *  of the FAQPage schema). Labels are localized alongside the Q&A. */
export interface FaqLink {
  label: string;
  href: string;
}

export interface FaqItem {
  /** Used verbatim for both the visible question and the JSON-LD `name`. */
  question: string;
  /** Plain text — used verbatim for both the visible answer and JSON-LD. */
  answer: string;
  /** Optional related-tool links shown below the answer. */
  links?: FaqLink[];
}

export interface FaqCategory {
  /** Stable id (locale-independent) for React keys. */
  id: string;
  /** Localized section heading. */
  title: string;
  items: FaqItem[];
}

const KO: FaqCategory[] = [
  {
    id: "privacy",
    title: "개인정보와 안전",
    items: [
      {
        question: "사진이 서버에 올라가나요?",
        answer:
          "아니요. Pixly의 모든 처리는 100% 내 브라우저 안에서 이뤄져요. 파일을 고르면 그 파일은 기기를 벗어나지 않고, 저희 서버로도 다른 어디로도 전송되지 않아요. 변환도 압축도 자르기도 모두 내 컴퓨터나 휴대폰이 직접 계산하는 거예요. 그래서 저희를 포함해 누구도 당신의 사진을 볼 수 없어요.",
      },
      {
        question: "광고는 왜 있나요? 광고 때문에 개인정보가 새지 않나요?",
        answer:
          "Pixly를 모두에게 무료로 제공하려고 광고를 조금 보여드려요. 다만 광고와 이미지 처리는 완전히 분리돼 있어요. 광고 시스템은 당신이 어떤 사진을 다루는지 전혀 알 수 없고, 파일이나 파일 이름은 광고를 포함해 어디로도 전송되지 않아요. 맞춤 광고가 불편하다면 Google 광고 설정에서 끌 수 있어요.",
        links: [{ label: "개인정보 처리방침", href: "/privacy/" }],
      },
      {
        question: "인터넷 없이 오프라인에서도 되나요?",
        answer:
          "네. 페이지를 한 번 열어두면 그다음부터는 인터넷 연결이 끊겨도 변환이 동작해요. 처리에 필요한 이미지 엔진이 브라우저 안에서 돌아가기 때문에, 파일을 주고받을 서버가 필요 없거든요. 비행기 안에서도, 신호가 약한 곳에서도 쓸 수 있어요.",
      },
    ],
  },
  {
    id: "cost",
    title: "비용과 사용",
    items: [
      {
        question: "정말 무료인가요? 워터마크나 개수 제한은 없나요?",
        answer:
          "네, 완전히 무료예요. 결제도, 유료 요금제도, 기간이 끝나는 무료 체험 같은 것도 없어요. 결과물에 워터마크가 찍히지도 않고, 하루에 몇 장까지만 된다는 개수 제한도 없어요. 필요한 만큼 얼마든지 변환하고, 자르고, 압축하세요.",
      },
      {
        question: "회원가입이나 로그인이 필요한가요?",
        answer:
          "아니요. 계정을 만들 필요도, 이메일을 적을 필요도 없어요. 페이지에 들어와 파일을 놓으면 바로 시작돼요. 개인정보를 요구하지 않으니 가입 절차 자체가 없어요.",
      },
      {
        question: "휴대폰(아이폰·안드로이드)에서도 되나요?",
        answer:
          "네. Pixly는 최신 모바일 브라우저에서 그대로 동작해요. 아이폰 사진(HEIC)을 아이폰에서 바로 JPG로 바꾸거나, 안드로이드에서 사진을 자르고 용량을 줄일 수 있어요. 화면 크기에 맞춰 배치도 자동으로 조정돼요. 다만 아주 큰 파일을 여러 개 다룰 때는 데스크톱이 조금 더 여유로워요.",
      },
      {
        question: "파일 크기 제한이 있나요?",
        answer:
          "따로 정해둔 업로드 용량 제한은 없어요. 파일을 서버에 올리는 게 아니라 내 기기에서 바로 처리하기 때문이에요. 현실적인 한계는 기기의 남은 메모리뿐이에요. 초고해상도 사진처럼 아주 큰 파일을 한꺼번에 여러 장 다루면 기기에 따라 느려질 수 있으니, 그럴 때는 몇 장씩 나눠서 처리하는 게 좋아요.",
      },
    ],
  },
  {
    id: "formats",
    title: "형식과 화질",
    items: [
      {
        question: "어떤 형식을 지원하나요?",
        answer:
          "JPG, PNG, WebP, GIF, BMP, HEIC, AVIF, TIFF 같은 일상적인 이미지 형식과 ICO, TGA, PSD 같은 형식까지 다뤄요. 예를 들어 아이폰 사진(HEIC)을 JPG나 PNG로, PNG를 용량이 작은 WebP로, AVIF를 익숙한 JPG로 바꿀 수 있어요. 필요한 변환을 아래에서 찾아 바로 시작하세요.",
        links: [
          { label: "HEIC → JPG", href: "/heic-to-jpg/" },
          { label: "PNG → WebP", href: "/png-to-webp/" },
          { label: "WebP → JPG", href: "/webp-to-jpg/" },
        ],
      },
      {
        question: "HEIC가 뭔가요? 왜 제 컴퓨터에서 안 열리죠?",
        answer:
          "HEIC는 아이폰과 아이패드가 사진을 저장할 때 기본으로 쓰는 형식이에요. 같은 화질을 더 작은 용량에 담을 수 있어 좋지만, 아직 지원하는 곳이 적어요. 특히 윈도우 PC나 오래된 앱, 여러 웹사이트에서는 열리지 않아 당황스러울 때가 많죠. HEIC를 JPG나 PNG로 바꾸면 어디서나 열리는 사진이 돼서 공유하거나 올리기 편해져요.",
        links: [
          { label: "HEIC → JPG", href: "/heic-to-jpg/" },
          { label: "HEIC → PNG", href: "/heic-to-png/" },
        ],
      },
      {
        question: "변환하면 화질이 떨어지나요?",
        answer:
          "형식에 따라 달라요. PNG처럼 화질을 그대로 보존하는 형식으로 바꾸면 손실이 없어요. JPG나 WebP처럼 용량을 줄이는 형식으로 바꿀 때는 아주 약간의 손실이 생길 수 있지만, 눈으로는 거의 구분되지 않는 수준이에요. Pixly는 기본적으로 화질을 넉넉하게 유지하고, 용량을 더 줄이고 싶을 때는 품질을 직접 조절할 수 있어요.",
      },
    ],
  },
  {
    id: "tools",
    title: "도구별 안내",
    items: [
      {
        question: "이미지를 PDF로 만들 수 있나요?",
        answer:
          "네. 여러 장의 JPG나 PNG를 하나의 PDF로 묶을 수 있고, 반대로 PDF의 각 페이지를 이미지로 뽑아낼 수도 있어요. 페이지 크기와 방향, 여백도 고를 수 있어요. 이것 역시 전부 브라우저 안에서 처리돼요.",
        links: [
          { label: "JPG → PDF", href: "/jpg-to-pdf/" },
          { label: "PNG → PDF", href: "/png-to-pdf/" },
          { label: "PDF → JPG", href: "/pdf-to-jpg/" },
        ],
      },
      {
        question: "사진 용량을 줄일 수 있나요?",
        answer:
          "네. 압축 도구에서 JPG, PNG, HEIC, WebP 사진을 원하는 목표 용량에 맞춰 줄일 수 있어요. 이메일 첨부나 업로드 용량 제한에 걸릴 때, 웹페이지를 가볍게 만들고 싶을 때 유용해요.",
        links: [{ label: "이미지 압축", href: "/compress/" }],
      },
      {
        question: "사진을 자를 수 있나요?",
        answer:
          "네. 자르기 도구에서 원하는 비율로 자르고, 회전하거나 기울어진 수평을 바로잡을 수 있어요. ‘스마트 크롭’을 누르면 상품이나 얼굴처럼 중요한 부분을 자동으로 찾아 맞춰줘요. 프로필 사진이나 썸네일을 만들 때 편리해요.",
        links: [{ label: "사진 자르기", href: "/crop/" }],
      },
      {
        question: "찾는 답이 없어요. 어떻게 문의하나요?",
        answer:
          "궁금한 점이나 버그 제보, 새로 지원했으면 하는 형식이 있다면 문의 페이지로 알려주세요. 보통 며칠 안에 답장드려요.",
        links: [{ label: "문의하기", href: "/contact/" }],
      },
    ],
  },
];

const EN: FaqCategory[] = [
  {
    id: "privacy",
    title: "Privacy & safety",
    items: [
      {
        question: "Are my photos uploaded to a server?",
        answer:
          "No. Everything in Pixly runs 100% inside your browser. When you pick a file, it never leaves your device — it isn't sent to our servers or anywhere else. Converting, compressing, and cropping are all done by your own computer or phone. That means no one, including us, can ever see your photos.",
      },
      {
        question: "Why are there ads? Do they leak my private data?",
        answer:
          "We show a few ads so Pixly can stay free for everyone. But the ads and the image processing are completely separate. The ad system has no idea what photos you're working with, and your files and filenames are never sent anywhere — not to advertisers, not to anyone. If you'd rather not see personalized ads, you can turn them off in your Google Ads settings.",
        links: [{ label: "Privacy Policy", href: "/privacy/" }],
      },
      {
        question: "Does it work offline, without an internet connection?",
        answer:
          "Yes. Once the page has loaded, conversions keep working even if your connection drops. The image engine that does the work runs inside your browser, so there's no server it needs to reach. You can use it on a plane or anywhere the signal is weak.",
      },
    ],
  },
  {
    id: "cost",
    title: "Cost & usage",
    items: [
      {
        question: "Is it really free? Any watermarks or limits?",
        answer:
          "Yes, completely free. There's no payment, no paid tier, and no free trial that expires. Your results carry no watermark, and there's no daily cap on how many images you can process. Convert, crop, and compress as much as you need.",
      },
      {
        question: "Do I need to sign up or log in?",
        answer:
          "No. There's no account to create and no email to enter. Just open the page, drop a file, and you're going. We don't ask for personal details, so there's no sign-up step at all.",
      },
      {
        question: "Does it work on my phone (iPhone / Android)?",
        answer:
          "Yes. Pixly works in modern mobile browsers as-is. You can turn an iPhone photo (HEIC) into a JPG right on your iPhone, or crop and shrink a picture on Android. The layout adapts to your screen size automatically. That said, a desktop has a bit more room when you're handling several large files at once.",
      },
      {
        question: "Is there a file-size limit?",
        answer:
          "There's no set upload limit, because your files aren't uploaded — they're processed right on your device. The only real ceiling is your device's available memory. If you throw a lot of very large files (say, ultra-high-resolution photos) at it at once, it can slow down on some devices, so it's best to do those in smaller batches.",
      },
    ],
  },
  {
    id: "formats",
    title: "Formats & quality",
    items: [
      {
        question: "Which formats do you support?",
        answer:
          "We handle everyday image formats like JPG, PNG, WebP, GIF, BMP, HEIC, AVIF, and TIFF, plus formats like ICO, TGA, and PSD. For example, you can turn an iPhone photo (HEIC) into a JPG or PNG, a PNG into a smaller WebP, or an AVIF into a familiar JPG. Find the conversion you need below and get started.",
        links: [
          { label: "HEIC → JPG", href: "/heic-to-jpg/" },
          { label: "PNG → WebP", href: "/png-to-webp/" },
          { label: "WebP → JPG", href: "/webp-to-jpg/" },
        ],
      },
      {
        question: "What is HEIC, and why won't it open on my computer?",
        answer:
          "HEIC is the format iPhones and iPads use by default when they save photos. It fits the same quality into a smaller file, which is great — but not many places support it yet. Windows PCs, older apps, and plenty of websites often can't open it, which catches people off guard. Convert HEIC to JPG or PNG and you get a photo that opens anywhere, ready to share or upload.",
        links: [
          { label: "HEIC → JPG", href: "/heic-to-jpg/" },
          { label: "HEIC → PNG", href: "/heic-to-png/" },
        ],
      },
      {
        question: "Will converting lower the quality?",
        answer:
          "It depends on the format. Converting to a lossless format like PNG keeps the quality exactly as-is. Converting to a space-saving format like JPG or WebP can lose a tiny bit, but it's usually invisible to the eye. Pixly keeps quality generous by default, and when you want a smaller file you can adjust the quality yourself.",
      },
    ],
  },
  {
    id: "tools",
    title: "Tools & help",
    items: [
      {
        question: "Can I make a PDF from images?",
        answer:
          "Yes. You can combine several JPGs or PNGs into a single PDF, or go the other way and pull each page of a PDF out as an image. You can choose the page size, orientation, and margins too. This all happens in your browser as well.",
        links: [
          { label: "JPG → PDF", href: "/jpg-to-pdf/" },
          { label: "PNG → PDF", href: "/png-to-pdf/" },
          { label: "PDF → JPG", href: "/pdf-to-jpg/" },
        ],
      },
      {
        question: "Can I make my photos smaller?",
        answer:
          "Yes. The compress tool shrinks JPG, PNG, HEIC, and WebP photos down to a target size you choose. It's handy when an email attachment or an upload runs into a size limit, or when you want to make a web page lighter.",
        links: [{ label: "Compress images", href: "/compress/" }],
      },
      {
        question: "Can I crop a photo?",
        answer:
          "Yes. The crop tool lets you cut to any aspect ratio, rotate, and straighten a tilted horizon. Hit Smart crop and it automatically finds what matters — a product or a face — and frames it. It's great for profile pictures and thumbnails.",
        links: [{ label: "Crop a photo", href: "/crop/" }],
      },
      {
        question: "I can't find my answer. How do I get in touch?",
        answer:
          "If you have a question, a bug to report, or a format you'd like us to support, let us know on the contact page. We usually reply within a couple of days.",
        links: [{ label: "Contact us", href: "/contact/" }],
      },
    ],
  },
];

/** The grouped FAQ — Korean is the default render (matches the static HTML). */
export function faqCategories(locale: Locale): FaqCategory[] {
  return locale === "ko" ? KO : EN;
}

/** Flattened Q&A for the FAQPage schema — SAME source as the visible list, so
 *  structured data always mirrors the copy shown on the page. */
export function faqEntries(locale: Locale): Faq[] {
  return faqCategories(locale).flatMap((c) =>
    c.items.map((i) => ({ question: i.question, answer: i.answer })),
  );
}
