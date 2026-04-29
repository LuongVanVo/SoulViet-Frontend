import { useState, useEffect, useRef } from 'react';
import { Smile, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store';

interface CommentInputProps {
    onSend: (content: string) => void;
    isSubmitting?: boolean;
    placeholder?: string;
    initialValue?: string;
    onCancel?: () => void;
    replyingToName?: string;
}

export const CommentInput = ({ 
    onSend, 
    isSubmitting, 
    placeholder, 
    initialValue = '', 
    onCancel,
    replyingToName
}: CommentInputProps) => {
    const { t } = useTranslation();
    const [content, setContent] = useState(initialValue);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        setContent(initialValue);
    }, [initialValue]);

    useEffect(() => {
        if (replyingToName) {
            setContent(`@${replyingToName} `);
            textareaRef.current?.focus();
        }
    }, [replyingToName]);

    const handleCancel = () => {
        setContent('');
        onCancel?.();
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (content.trim() && !isSubmitting) {
            onSend(content.trim());
            setContent('');
        }
    };

    const adjustHeight = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 300)}px`;
    };

    useEffect(() => {
        adjustHeight();
    }, [content]);

    return (
        <div className="flex flex-col bg-white border-t border-[#F1F5F9]">
            {replyingToName && (
                <div className="flex items-center justify-between bg-[#F8FAFC] px-4 py-2 border-b border-[#F1F5F9]">
                    <span className="text-[12px] text-[#64748B]">
                        {t('social.comments.replyingTo', { defaultValue: 'Đang trả lời' })} <span className="font-bold text-[#1E293B]">{replyingToName}</span>
                    </span>
                    <button 
                        onClick={handleCancel}
                        className="text-[#94A3B8] hover:text-[#64748B]"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
            <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 px-3 py-3"
            >
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-gray-100">
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs font-bold text-gray-400">
                            {user?.name?.charAt(0)}
                        </div>
                    )}
                </div>

                <div className="flex flex-1 items-center gap-2 rounded-full border border-[#E2E8F0] px-3 py-2 focus-within:border-[#CBD5E1] transition-colors">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                        placeholder={placeholder || t('social.comments.placeholder', { defaultValue: 'Thêm bình luận...' })}
                        className="flex-1 bg-transparent text-[14px] focus:outline-none placeholder-[#94A3B8] resize-none overflow-hidden max-h-[300px]"
                        disabled={isSubmitting}
                    />

                    <div className="flex items-center gap-2 shrink-0">
                        <button type="button" className="text-[#64748B] hover:text-[#1E293B]">
                            <Smile className="h-5 w-5" />
                        </button>
                        <div className="text-[10px] font-bold text-[#64748B] border border-[#64748B] rounded px-1 py-0.5 scale-75 cursor-pointer hover:bg-gray-50">
                            GIF
                        </div>
                    </div>
                </div>

                {initialValue && !replyingToName && (
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="text-[12px] font-medium text-[#64748B] hover:text-[#1E293B] px-1"
                    >
                        {t('common.cancel', { defaultValue: 'Hủy' })}
                    </button>
                )}

                <button
                    type="submit"
                    disabled={!content.trim() || isSubmitting}
                    className={`text-[14px] font-bold transition-colors shrink-0 px-1 ${content.trim() && !isSubmitting
                            ? 'text-blue-500 hover:text-blue-600'
                            : 'text-blue-300 cursor-not-allowed'
                        }`}
                >
                    {isSubmitting ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    ) : (
                        t('social.comments.post', { defaultValue: 'Đăng' })
                    )}
                </button>
            </form>
        </div>
    );
};
