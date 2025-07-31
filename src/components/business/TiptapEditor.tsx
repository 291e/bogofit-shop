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
  placeholder?: string;
}

export default function TiptapEditor({
  content,
  onChange,
  onDetailImageUpload,
  placeholder,
}: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFirstImage, setIsFirstImage] = useState<boolean>(true); // 첫 번째 이미지 여부 추적

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
    onUpdate: ({ editor }: { editor: unknown }) => {
      const editorInstance = editor as { getHTML: () => string };
      onChange(editorInstance.getHTML());
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
      // 1. Presigned URL 발급
      const presignedResponse = await fetch(
        "/api/business/upload/presigned-url",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            folder: "product-detail", // 상세 설명 이미지 폴더
          }),
        }
      );

      if (!presignedResponse.ok) {
        throw new Error("Presigned URL 발급 실패");
      }

      const { data: presignedData } = await presignedResponse.json();
      const { uploadUrl, s3Url } = presignedData;

      // 2. S3에 직접 업로드
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
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

  const handleImageUpload = useCallback(
    async (file: File) => {
      try {
        // S3에 이미지 업로드
        const imageUrl = await uploadImageToS3(file);

        // 에디터에 이미지 삽입
        if (editor) {
          editor.chain().focus().setImage({ src: imageUrl }).run();
        }

        // 첫 번째 이미지인 경우에만 detailImage 콜백 호출
        if (isFirstImage && onDetailImageUpload) {
          onDetailImageUpload(imageUrl);
          setIsFirstImage(false); // 첫 번째 이미지 플래그 해제
        }

        console.log("에디터 이미지 추가 완료:", imageUrl);
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
        alert("이미지 업로드에 실패했습니다: " + error);
      }
    },
    [editor, isFirstImage, onDetailImageUpload]
  );

  const addImage = useCallback(() => {
    // 파일 선택 다이얼로그 열기
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // 이미지 파일인지 확인
        if (!file.type.startsWith("image/")) {
          alert("이미지 파일만 업로드할 수 있습니다.");
          return;
        }

        // 파일 크기 확인 (10MB 제한)
        if (file.size > 10 * 1024 * 1024) {
          alert("파일 크기는 10MB 이하여야 합니다.");
          return;
        }

        handleImageUpload(file);
      }

      // 파일 입력 초기화
      e.target.value = "";
    },
    [handleImageUpload]
  );

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("링크 URL을 입력하세요:", previousUrl);

    if (url === null) {
      return;
    }

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
    <div className="border border-gray-300 rounded-lg">
      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 툴바 */}
      <div className="flex flex-wrap items-center gap-1 p-3 border-b border-gray-200 bg-gray-50">
        {/* 실행 취소/다시 실행 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
        >
          <Redo className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* 텍스트 포맷팅 */}
        <Button
          variant={editor.isActive("bold") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive("italic") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive("underline") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* 리스트 */}
        <Button
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive("orderedList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* 정렬 */}
        <Button
          variant={editor.isActive({ textAlign: "left" }) ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant={
            editor.isActive({ textAlign: "center" }) ? "default" : "ghost"
          }
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant={
            editor.isActive({ textAlign: "right" }) ? "default" : "ghost"
          }
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* 링크 & 이미지 */}
        <Button variant="ghost" size="sm" onClick={setLink}>
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={addImage}>
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* 에디터 */}
      <div className="min-h-[200px]">
        <EditorContent
          editor={editor}
          placeholder={
            placeholder ||
            "📝 상품의 상세 정보를 작성해주세요!\n\n• 제품의 특징과 장점을 설명해주세요\n• 사이즈, 소재, 색상 등 구체적인 정보를 포함해주세요\n• 🖼️ 상단 툴바의 이미지 버튼으로 제품 상세 이미지를 추가할 수 있습니다\n• 💡 링크, 굵은 글씨, 목록 등 다양한 서식을 활용해보세요"
          }
        />
      </div>
    </div>
  );
}
