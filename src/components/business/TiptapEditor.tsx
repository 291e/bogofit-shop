"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ImageIcon,
  Link as LinkIcon,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCallback, useRef, useState } from "react";

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onDetailImageUpload?: (imageUrl: string) => void; // 첫 번째 이미지만 detailImage로 전달
  onUploadStateChange?: (isUploading: boolean) => void; // 업로드 상태 변경 콜백
  placeholder?: string;
}

export default function TiptapEditor({
  content,
  onChange,
  onDetailImageUpload,
  onUploadStateChange,
  placeholder,
}: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFirstImage, setIsFirstImage] = useState<boolean>(true); // 첫 번째 이미지 여부 추적
  const [isUploading, setIsUploading] = useState<boolean>(false); // 이미지 업로드 중 상태
  const [isDragging, setIsDragging] = useState<boolean>(false); // 드래그 상태

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
    ],
    content,
    immediatelyRender: false, // SSR hydration 문제 해결
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4",
      },
    },
  });

  // S3 이미지 업로드 함수
  const uploadImageToS3 = async (file: File): Promise<string> => {
    try {
      const presignedResponse = await fetch(
        "/api/business/upload/presigned-url",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            folder: "product-detail",
          }),
        }
      );

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json();
        throw new Error(errorData.error || "Presigned URL 발급 실패");
      }

      const { data: presignedData } = await presignedResponse.json();
      const { uploadUrl, s3Url } = presignedData;

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error("S3 업로드 실패");
      }

      console.log(`에디터 이미지 S3 업로드 성공: ${s3Url}`);
      return s3Url;
    } catch (error) {
      console.error("에디터 이미지 업로드 실패:", error);
      throw error;
    }
  };

  const handleFilesUpload = useCallback(
    async (files: File[]) => {
      if (isUploading) {
        console.log("이미 업로드 중입니다.");
        return;
      }
      if (!editor) return;

      setIsUploading(true);
      onUploadStateChange?.(true);

      let firstImageProcessed = !isFirstImage;

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          console.log(
            `이미지 업로드 시작 (${i + 1}/${files.length}):`,
            file.name
          );

          try {
            const imageUrl = await uploadImageToS3(file);

            // 현재 커서 위치에 이미지 삽입 (기존 내용을 덮어쓰지 않음)
            editor.chain().focus().setImage({ src: imageUrl }).run();

            // 이미지 삽입 후 커서를 이미지 다음으로 이동하고 새 줄 추가
            editor.chain().focus().enter().run();

            if (!firstImageProcessed && onDetailImageUpload) {
              onDetailImageUpload(imageUrl);
              firstImageProcessed = true;
              setIsFirstImage(false);
            }
            console.log(
              `에디터 이미지 추가 완료 (${i + 1}/${files.length}):`,
              imageUrl
            );
          } catch (error) {
            console.error(`'${file.name}' 업로드 실패:`, error);
            editor
              .chain()
              .focus()
              .insertContent(
                `<p style="color: #dc2626; background: #fef2f2; padding: 8px; border-radius: 4px; border-left: 4px solid #dc2626;">⚠️ '${file.name}' 업로드 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}</p>`
              )
              .run();
          }
        }
      } finally {
        setIsUploading(false);
        onUploadStateChange?.(false);
      }
    },
    [
      editor,
      isUploading,
      isFirstImage,
      onDetailImageUpload,
      onUploadStateChange,
    ]
  );

  const addImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const validFiles = Array.from(files).filter((file) => {
          if (!file.type.startsWith("image/")) {
            alert(`${file.name}은(는) 이미지 파일이 아닙니다.`);
            return false;
          }
          if (file.size > 10 * 1024 * 1024) {
            alert(`${file.name}의 파일 크기가 10MB를 초과합니다.`);
            return false;
          }
          return true;
        });

        if (validFiles.length > 0) {
          handleFilesUpload(validFiles);
        }
      }
      e.target.value = "";
    },
    [handleFilesUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const validFiles = Array.from(files).filter((file) => {
          if (!file.type.startsWith("image/")) {
            return false; // 드롭된 파일 중 이미지가 아닌 것은 조용히 무시
          }
          if (file.size > 10 * 1024 * 1024) {
            alert(`${file.name}의 파일 크기가 10MB를 초과합니다.`);
            return false;
          }
          return true;
        });

        if (validFiles.length > 0) {
          handleFilesUpload(validFiles);
        }
      }
    },
    [handleFilesUpload]
  );

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("링크 URL을 입력하세요:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={`border rounded-lg transition-all ${isDragging ? "border-blue-500 border-dashed ring-4 ring-blue-100" : "border-gray-300"}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        multiple // 여러 파일 선택 허용
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 border-b border-gray-200 bg-gray-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
        >
          <Redo className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Button
          type="button"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("underline") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Button
          type="button"
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("orderedList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Button
          type="button"
          variant={editor.isActive({ textAlign: "left" }) ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={
            editor.isActive({ textAlign: "center" }) ? "default" : "ghost"
          }
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={
            editor.isActive({ textAlign: "right" }) ? "default" : "ghost"
          }
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Button type="button" variant="ghost" size="sm" onClick={setLink}>
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addImage}
          disabled={isUploading}
        >
          {isUploading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Editor */}
      <div className="relative min-h-[300px]">
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-500 bg-opacity-20 pointer-events-none">
            <p className="text-lg font-bold text-blue-600">
              여기에 이미지를 드롭하세요
            </p>
          </div>
        )}
        <EditorContent
          editor={editor}
          placeholder={
            placeholder ||
            "📝 상품의 상세 정보를 작성해주세요!\n\n• 🖼️ 이미지 파일을 드래그 앤 드롭하여 여러 장을 한 번에 추가할 수 있습니다.\n• 제품의 특징과 장점을 설명해주세요\n• 사이즈, 소재, 색상 등 구체적인 정보를 포함해주세요\n• 💡 링크, 굵은 글씨, 목록 등 다양한 서식을 활용해보세요"
          }
        />
      </div>
    </div>
  );
}
