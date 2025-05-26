import "./globals.css";

export const metadata = {
  title: "多言語ニュース集約サイト",
  description: "日本、韓国、香港の最新ニュースを日本語で自動翻訳してお届け",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  );
}