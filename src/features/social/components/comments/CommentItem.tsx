import { MoreHorizontal, Heart, Trash2, Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PostComment } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import i18next from 'i18next';
import { useAuthStore } from '@/store';
import { useMemo, useState } from 'react';
import { useCommentReplies } from '@/hooks';

import { Link } from 'react-router-dom';

interface CommentItemProps {
    comment: PostComment;
    postAuthorId?: string;
    isAuthor?: boolean;
    isReply?: boolean;
    onReply?: (comment: PostComment) => void;
    onDelete?: (commentId: string) => void;
    onEdit?: (comment: PostComment) => void;
}

export const CommentItem = ({ comment, postAuthorId, isAuthor, isReply, onReply, onDelete, onEdit }: CommentItemProps) => {
    const { t } = useTranslation();
    const currentUser = useAuthStore(state => state.user);
    const [showOptions, setShowOptions] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [visibleRepliesCount, setVisibleRepliesCount] = useState(3);

    const { replies: fetchedReplies, isLoading: isLoadingReplies, isError: isErrorReplies } = useCommentReplies(
        comment.id,
        showReplies && (!comment.replies || comment.replies.length === 0)
    );

    const allReplies = useMemo(() => {
        const localReplies = comment.replies || [];
        const apiReplies = fetchedReplies || [];

        const replyMap = new Map();
        [...apiReplies, ...localReplies].forEach(r => replyMap.set(r.id, r));

        return Array.from(replyMap.values()).sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
    }, [comment.replies, fetchedReplies]);

    useState(() => {
        if (comment.replies && comment.replies.length > 0) {
            setShowReplies(true);
        }
    });

    const prevRepliesLength = useState(comment.replies?.length || 0)[0];
    if (comment.replies && comment.replies.length > (prevRepliesLength || 0)) {
        if (!showReplies) setShowReplies(true);
    }

    const isCommentOwner = currentUser?.id === comment.userId;
    const currentLocale = i18next.language === 'vi' ? vi : enUS;

    const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
        addSuffix: false,
        locale: currentLocale,
    });

    const totalRepliesCount = Math.max(Number(comment.repliesCount) || 0, allReplies.length);
    const hasReplies = totalRepliesCount > 0;
    const hasMoreReplies = allReplies.length > visibleRepliesCount;

    const renderContent = (content: string) => {
        const parts = content.split(/(@[\w._]+)/g);
        return parts.map((part, index) => {
            if (part.startsWith('@')) {
                return (
                    <span key={index} className="font-semibold text-[#00376B] hover:underline cursor-pointer">
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    const profileLink = `/profile/${comment.userId}`;

    return (
        <div className="flex flex-col">
            <div className={`group flex gap-3 px-4 py-2 transition-colors ${isReply ? 'pl-14' : ''}`}>
                <Link 
                    to={profileLink}
                    className={`${isReply ? 'h-6 w-6' : 'h-8 w-8'} shrink-0 overflow-hidden rounded-full bg-gray-100 transition-opacity hover:opacity-80`}
                >
                    {comment.avatarUrl ? (
                        <img
                            src={comment.avatarUrl}
                            alt={comment.fullName}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className={`flex h-full w-full items-center justify-center bg-[#E2E8F0] ${isReply ? 'text-[10px]' : 'text-[12px]'} font-bold text-[#64748B]`}>
                            {comment.fullName?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </Link>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="text-[13px] leading-[1.4] break-words">
                            <div className="flex items-center gap-1 mb-0.5">
                                <Link to={profileLink} className="font-bold text-[#1E293B] hover:underline">
                                    {comment.fullName}
                                </Link>
                                {isAuthor && (
                                    <span className="text-[12px] text-[#64748B]">
                                        • {t('social.comments.author', { defaultValue: 'Tác giả' })}
                                    </span>
                                )}
                            </div>
                            <div className="text-[#334155] whitespace-pre-wrap">
                                {renderContent(comment.content)}
                            </div>
                        </div>
                        <button className="text-[#94A3B8] hover:text-[#EF4444] transition-colors flex-shrink-0">
                            <Heart className="h-3 w-3" />
                        </button>
                    </div>

                    <div className="mt-1 flex items-center gap-4 text-[11px] font-bold text-[#64748B]">
                        <span className="font-normal text-[#94A3B8]">{timeAgo}</span>
                        <button
                            onClick={() => onReply?.(comment)}
                            className="hover:text-[#1E293B]"
                        >
                            {t('social.comments.reply', { defaultValue: 'Trả lời' })}
                        </button>

                        {isCommentOwner && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowOptions(!showOptions)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#1E293B]"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>

                                {showOptions && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setShowOptions(false)}
                                        />
                                        <div className="absolute left-0 top-full z-20 mt-1 min-w-[120px] rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg">
                                            <button
                                                onClick={() => {
                                                    onEdit?.(comment);
                                                    setShowOptions(false);
                                                }}
                                                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-[#334155] hover:bg-[#F8FAFC]"
                                            >
                                                <Edit2 className="h-3 w-3" />
                                                {t('social.comments.edit', { defaultValue: 'Chỉnh sửa' })}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onDelete?.(comment.id);
                                                    setShowOptions(false);
                                                }}
                                                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-[#DC2626] hover:bg-[#FEF2F2]"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                                {t('social.comments.delete', { defaultValue: 'Xóa' })}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {hasReplies && (
                <div className="pl-14">
                    {!showReplies ? (
                        <button
                            onClick={() => setShowReplies(true)}
                            className="flex items-center gap-2 py-2 text-[12px] font-bold text-[#64748B] hover:text-[#1E293B]"
                        >
                            <div className="h-[1px] w-8 bg-[#94A3B8]" />
                            {t('social.comments.viewReplies', { defaultValue: 'Xem câu trả lời' })} ({totalRepliesCount})
                        </button>
                    ) : (
                        <div className="mt-1">
                            {isLoadingReplies && allReplies.length === 0 && (
                                <div className="py-2 pl-2 text-[12px] text-[#64748B]">
                                    {t('common.loading', { defaultValue: 'Đang tải...' })}
                                </div>
                            )}

                            {isErrorReplies && (
                                <div className="py-2 pl-2 text-[12px] text-red-500">
                                    {t('social.comments.errorLoadingReplies', { defaultValue: 'Không thể tải phản hồi' })}
                                </div>
                            )}

                            {allReplies.slice(0, visibleRepliesCount).map((reply) => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    postAuthorId={postAuthorId}
                                    isAuthor={postAuthorId === reply.userId}
                                    isReply={true}
                                    onReply={onReply}
                                    onDelete={onDelete}
                                    onEdit={onEdit}
                                />
                            ))}

                            {hasMoreReplies ? (
                                <button
                                    onClick={() => setVisibleRepliesCount(prev => prev + 5)}
                                    className="flex items-center gap-2 py-2 text-[12px] font-bold text-[#64748B] hover:text-[#1E293B]"
                                >
                                    <div className="h-[1px] w-8 bg-[#94A3B8]" />
                                    {t('social.comments.viewMoreReplies', { defaultValue: 'Xem thêm câu trả lời...' })}
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setShowReplies(false);
                                        setVisibleRepliesCount(3);
                                    }}
                                    className="flex items-center gap-2 py-2 text-[12px] font-bold text-[#64748B] hover:text-[#1E293B]"
                                >
                                    <div className="h-[1px] w-8 bg-[#94A3B8]" />
                                    {t('social.comments.hideReplies', { defaultValue: 'Ẩn phản hồi' })}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
