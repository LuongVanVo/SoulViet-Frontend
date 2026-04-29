import { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePostComments, usePostCommentStream } from '@/hooks';
import type { PostComment } from '@/types';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import i18next from 'i18next';
import { useAuthStore } from '@/store';

interface CommentSectionProps {
    postId: string;
    postAuthorId?: string;
    onClose?: () => void;
    authorName?: string;
    authorAvatar?: string;
    caption?: string;
    createdAt?: string;
}

export const CommentSection = ({
    postId,
    postAuthorId,
    onClose,
    authorName,
    authorAvatar,
    caption,
    createdAt
}: CommentSectionProps) => {
    const { t } = useTranslation();
    const currentLocale = i18next.language === 'vi' ? vi : enUS;
    const currentUserId = useAuthStore((state) => state.user?.id);
    const isOwnPost = currentUserId === postAuthorId;

    const {
        comments,
        isLoading,
        addComment,
        deleteComment,
        updateComment,
        isSubmitting,
        isUpdating
    } = usePostComments(postId, true);

    const [editingComment, setEditingComment] = useState<PostComment | null>(null);
    const [replyingTo, setReplyingTo] = useState<PostComment | null>(null);

    usePostCommentStream(postId);

    const handleSendComment = async (content: string) => {
        try {
            if (editingComment) {
                await updateComment({
                    commentId: editingComment.id,
                    content,
                });
                setEditingComment(null);
            } else if (replyingTo) {
                await addComment({
                    postId,
                    content,
                    parentCommentId: replyingTo.id,
                });
                setReplyingTo(null);
            } else {
                await addComment({
                    postId,
                    content,
                });
            }
        } catch (error) {
            console.error('Failed to post comment:', error);
        }
    };

    return (
        <div className="flex h-full flex-col bg-white">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] px-4 py-3 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 overflow-hidden rounded-full ring-1 ring-gray-100">
                        {authorAvatar ? (
                            <img src={authorAvatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs font-bold text-gray-400">
                                {authorName?.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[14px] font-bold text-[#1E293B]">{authorName}</span>
                            {!isOwnPost && (
                                <span className="text-[14px] font-bold text-blue-500 hover:text-blue-600 cursor-pointer">
                                    • {t('social.feed.follow', { defaultValue: 'Theo dõi' })}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-[#F1F5F9] transition-colors md:hidden"
                >
                    <X className="h-5 w-5 text-[#64748B]" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="divide-y divide-[#F1F5F9]/30">
                    {caption && (
                        <div className="flex gap-3 px-4 py-4">
                            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-gray-100">
                                <img src={authorAvatar} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="text-[14px]">
                                    <span className="font-bold text-[#1E293B] mr-2">{authorName}</span>
                                    <span className="text-[13px] text-[#64748B]">
                                        • {t('social.comments.author', { defaultValue: 'Tác giả' })}
                                    </span>
                                    <div className="text-[#334155] leading-[1.4] whitespace-pre-wrap mt-1">
                                        {caption}
                                    </div>
                                </div>
                                <div className="text-[12px] text-[#64748B]">
                                    {createdAt && formatDistanceToNow(new Date(createdAt), { locale: currentLocale })}
                                </div>
                            </div>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex h-40 items-center justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                        </div>
                    ) : comments.length > 0 ? (
                        comments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                isAuthor={postAuthorId === comment.userId}
                                onDelete={(id) => deleteComment(id)}
                                onEdit={(comment) => setEditingComment(comment)}
                                onReply={(comment) => {
                                    setEditingComment(null);
                                    setReplyingTo(comment);
                                }}
                            />
                        ))
                    ) : !caption && (
                        <div className="py-20 text-center">
                            <p className="text-sm text-gray-400">{t('social.comments.empty', { defaultValue: 'Chưa có bình luận nào.' })}</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="border-t border-[#F1F5F9] shrink-0">
                <CommentInput
                    onSend={handleSendComment}
                    isSubmitting={isSubmitting || isUpdating}
                    initialValue={editingComment?.content}
                    replyingToName={replyingTo?.fullName}
                    onCancel={() => {
                        setEditingComment(null);
                        setReplyingTo(null);
                    }}
                />
            </div>
        </div>
    );
};
