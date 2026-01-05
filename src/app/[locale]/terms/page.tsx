import ReactMarkdown from "react-markdown";
import fs from "fs";
import path from "path";

export const metadata = {
  title: "Terms of Service - CoupleCents",
  description: "Terms of Service for CoupleCents financial application",
};

export default function TermsPage() {
  const filePath = path.join(process.cwd(), "terms-of-service.md");
  const fileContent = fs.readFileSync(filePath, "utf-8");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => (
                <h1
                  className="text-4xl font-bold text-gray-900 mb-6"
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  className="text-2xl font-bold text-gray-800 mt-8 mb-4 border-b-2 border-blue-500 pb-2"
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  className="text-xl font-semibold text-gray-700 mt-6 mb-3"
                  {...props}
                />
              ),
              p: ({ node, ...props }) => (
                <p className="text-gray-600 mb-4 leading-relaxed" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul
                  className="list-disc list-inside text-gray-600 mb-4 space-y-2"
                  {...props}
                />
              ),
              ol: ({ node, ...props }) => (
                <ol
                  className="list-decimal list-inside text-gray-600 mb-4 space-y-2"
                  {...props}
                />
              ),
              a: ({ node, ...props }) => (
                <a
                  className="text-blue-600 hover:text-blue-800 underline"
                  {...props}
                />
              ),
              strong: ({ node, ...props }) => (
                <strong className="font-bold text-gray-800" {...props} />
              ),
            }}
          >
            {fileContent}
          </ReactMarkdown>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Last updated: January 5, 2026
          </p>
        </div>
      </div>
    </div>
  );
}
