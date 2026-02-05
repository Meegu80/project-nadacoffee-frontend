import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { MdFormatBold, MdFormatItalic, MdFormatListBulleted, MdFormatListNumbered, MdImage, MdUndo, MdRedo } from 'react-icons/md';
import { uploadImage } from '../../api/upload.api';

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
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
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
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-1 flex-wrap">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${editor.isActive('bold') ? 'bg-gray-200 text-brand-dark' : 'text-gray-500'}`}
        >
          <MdFormatBold size={20} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${editor.isActive('italic') ? 'bg-gray-200 text-brand-dark' : 'text-gray-500'}`}
        >
          <MdFormatItalic size={20} />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${editor.isActive('bulletList') ? 'bg-gray-200 text-brand-dark' : 'text-gray-500'}`}
        >
          <MdFormatListBulleted size={20} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${editor.isActive('orderedList') ? 'bg-gray-200 text-brand-dark' : 'text-gray-500'}`}
        >
          <MdFormatListNumbered size={20} />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
        <button
          type="button"
          onClick={addImage}
          className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
        >
          <MdImage size={20} />
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500 disabled:opacity-30"
        >
          <MdUndo size={20} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500 disabled:opacity-30"
        >
          <MdRedo size={20} />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default WebEditor;
