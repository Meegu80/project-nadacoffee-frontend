import { useEditor, EditorContent, Editor, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { twMerge } from "tailwind-merge";
import {
    MdFormatBold,
    MdFormatItalic,
    MdFormatStrikethrough,
    MdFormatListBulleted,
    MdFormatListNumbered,
    MdImage,
    MdFormatQuote,
    MdCode,
    MdFormatAlignLeft,
    MdFormatAlignCenter,
    MdFormatAlignRight,
    MdUndo,
    MdRedo,
    MdFormatSize,
    MdHorizontalRule,
    MdInsertLink,
    MdLinkOff,
    MdHighlight,
    MdFormatClear,
    MdColorize,
} from "react-icons/md";
import { uploadImage } from '../../api/upload.api';

// 커스텀 폰트 사이즈 확장 기능 정의
const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() {
        return {
            types: ['textStyle'],
        }
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
                        renderHTML: attributes => {
                            if (!attributes.fontSize) return {};
                            return { style: `font-size: ${attributes.fontSize}px` };
                        },
                    },
                },
            },
        ]
    },
    addCommands() {
        return {
            setFontSize: (fontSize: string) => ({ chain }: any) => {
                return chain().setMark('textStyle', { fontSize }).run();
            },
            unsetFontSize: () => ({ chain }: any) => {
                return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
            },
        } as any;
    },
});

interface WebEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const WebEditor = ({ value, onChange, placeholder = '내용을 입력하세요...' }: WebEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Image.configure({ inline: true }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      FontSize,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-8 bg-white',
      },
    },
  });

  if (!editor) return null;

  const addImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const url = await uploadImage(file, 'editor');
          editor.chain().focus().setImage({ src: url }).run();
        } catch (error) {
          alert('이미지 업로드 실패');
        }
      }
    };
    input.click();
  };

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      <EditorToolbar editor={editor} onImageUpload={addImage} />
      <div className="bg-white border-t border-gray-100">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

interface EditorToolbarProps {
    editor: Editor | null;
    onImageUpload: () => void;
}

const FONT_SIZES = ["12", "14", "16", "18", "20", "24", "30", "36"];

function EditorToolbar({ editor, onImageUpload }: EditorToolbarProps) {
    if (!editor) return null;

    const setLink = () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL을 입력하세요", previousUrl);

        if (url === null) return;
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    const ToolbarButton = ({ 
        onClick, 
        isActive = false, 
        children, 
        disabled = false,
        title
    }: { 
        onClick: () => void; 
        isActive?: boolean; 
        children: React.ReactNode;
        disabled?: boolean;
        title?: string;
    }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={twMerge(
                "p-2 rounded-lg hover:bg-gray-200 transition-all",
                isActive ? "bg-brand-dark text-brand-yellow shadow-sm" : "text-gray-500",
                disabled && "opacity-30 cursor-not-allowed"
            )}
        >
            {children}
        </button>
    );

    return (
        <div className="p-2 flex gap-1 bg-gray-50/50 flex-wrap items-center">
            {/* 히스토리 */}
            <div className="flex border-r border-gray-200 pr-1 mr-1">
                <ToolbarButton 
                    onClick={() => editor.chain().focus().undo().run()} 
                    disabled={!editor.can().undo()} 
                    title="실행 취소"
                >
                    <MdUndo size={20} />
                </ToolbarButton>
                <ToolbarButton 
                    onClick={() => editor.chain().focus().redo().run()} 
                    disabled={!editor.can().redo()} 
                    title="다시 실행"
                >
                    <MdRedo size={20} />
                </ToolbarButton>
            </div>

            {/* 폰트 크기 선택 */}
            <div className="flex border-r border-gray-200 pr-1 mr-1">
                <select
                    className="bg-transparent text-xs font-bold text-gray-600 p-1 rounded hover:bg-gray-200 outline-none cursor-pointer"
                    onChange={(e) => {
                        if (e.target.value === "default") {
                            (editor.chain().focus() as any).unsetFontSize().run();
                        } else {
                            (editor.chain().focus() as any).setFontSize(e.target.value).run();
                        }
                    }}
                    value={editor.getAttributes("textStyle").fontSize || "default"}
                >
                    <option value="default">기본 크기</option>
                    {FONT_SIZES.map(size => (
                        <option key={size} value={size}>{size}px</option>
                    ))}
                </select>
            </div>

            {/* 색상 선택 */}
            <div className="flex items-center border-r border-gray-200 pr-1 mr-1">
                <div className="relative flex items-center p-1 rounded hover:bg-gray-200 transition-all cursor-pointer">
                    <MdColorize size={18} className="text-gray-500 mr-1" />
                    <div 
                        className="w-4 h-4 rounded-sm border border-gray-300" 
                        style={{ backgroundColor: editor.getAttributes("textStyle").color || "#000000" }}
                    />
                    <input
                        type="color"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
                        value={editor.getAttributes("textStyle").color || "#000000"}
                        title="글자 색상 선택"
                    />
                </div>
            </div>

            {/* 서식 초기화 */}
            <div className="flex border-r border-gray-200 pr-1 mr-1">
                <ToolbarButton 
                    onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} 
                    title="모든 서식 지우기"
                >
                    <MdFormatClear size={20} />
                </ToolbarButton>
            </div>

            {/* 텍스트 스타일 */}
            <div className="flex gap-1 border-r border-gray-200 pr-1 mr-1">
                <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive("heading", { level: 2 })}
                    title="제목 (H2)"
                >
                    <MdFormatSize size={20} />
                </ToolbarButton>
                <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive("bold")}
                    title="굵게"
                >
                    <MdFormatBold size={20} />
                </ToolbarButton>
                <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive("italic")}
                    title="기울임"
                >
                    <MdFormatItalic size={20} />
                </ToolbarButton>
                <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive("strike")}
                    title="취소선"
                >
                    <MdFormatStrikethrough size={20} />
                </ToolbarButton>
                <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    isActive={editor.isActive("highlight")}
                    title="형광펜"
                >
                    <MdHighlight size={20} />
                </ToolbarButton>
            </div>

            {/* 링크 및 미디어 */}
            <div className="flex gap-1 border-r border-gray-200 pr-1 mr-1">
                <ToolbarButton onClick={setLink} isActive={editor.isActive("link")} title="링크 삽입">
                    <MdInsertLink size={20} />
                </ToolbarButton>
                <ToolbarButton 
                    onClick={() => editor.chain().focus().unsetLink().run()} 
                    disabled={!editor.isActive("link")}
                    title="링크 해제"
                >
                    <MdLinkOff size={20} />
                </ToolbarButton>
                <ToolbarButton onClick={onImageUpload} title="이미지 업로드">
                    <MdImage size={20} />
                </ToolbarButton>
            </div>

            {/* 리스트 및 인용 */}
            <div className="flex gap-1 border-r border-gray-200 pr-1 mr-1">
                <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive("bulletList")}
                    title="글머리 기호"
                >
                    <MdFormatListBulleted size={20} />
                </ToolbarButton>
                <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive("orderedList")}
                    title="번호 매기기"
                >
                    <MdFormatListNumbered size={20} />
                </ToolbarButton>
                <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive("blockquote")}
                    title="인용구"
                >
                    <MdFormatQuote size={20} />
                </ToolbarButton>
                <ToolbarButton 
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive("codeBlock")}
                    title="코드 블록"
                >
                    <MdCode size={20} />
                </ToolbarButton>
            </div>

            {/* 정렬 및 기타 */}
            <div className="flex gap-1">
                <ToolbarButton 
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    isActive={editor.isActive({ textAlign: "left" })}
                    title="왼쪽 정렬"
                >
                    <MdFormatAlignLeft size={20} />
                </ToolbarButton>
                <ToolbarButton 
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    isActive={editor.isActive({ textAlign: "center" })}
                    title="가운데 정렬"
                >
                    <MdFormatAlignCenter size={20} />
                </ToolbarButton>
                <ToolbarButton 
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    isActive={editor.isActive({ textAlign: "right" })}
                    title="오른쪽 정렬"
                >
                    <MdFormatAlignRight size={20} />
                </ToolbarButton>
                <ToolbarButton 
                    onClick={() => editor.chain().focus().setHorizontalRule().run()} 
                    title="가로 구분선"
                >
                    <MdHorizontalRule size={20} />
                </ToolbarButton>
            </div>
        </div>
    );
}

export default WebEditor;
