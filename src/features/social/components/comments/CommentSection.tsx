import { useState } from 'react';
import { X, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePostComments, usePostCommentStream, useSocialPostActions } from '@/hooks';
import type { SocialPost, PostComment } from '@/types';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import i18next from 'i18next';
import { useAuthStore } from '@/store';
import { ShareModal } from '@/components/social/ShareModal';

import { useNavigate } from 'react-router-dom';

interface CommentSectionProps {
    post: SocialPost;
    onClose?: () => void;
}

export const CommentSection = ({
    post,
    onClose,
}: CommentSectionProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const currentLocale = i18next.language === 'vi' ? vi : enUS;
    const currentUserId = useAuthStore((state) => state.user?.id);
    const isOwnPost = currentUserId === post.userId;

    const {
        comments,
        isLoading,
        addComment,
        deleteComment,
        updateComment,
        isSubmitting,
        isUpdating
    } = usePostComments(post.id, !currentUserId ? false : true);

    const { likePost, isLiking } = useSocialPostActions();
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const [editingComment, setEditingComment] = useState<PostComment | null>(null);
    const [replyingTo, setReplyingTo] = useState<PostComment | null>(null);

    usePostCommentStream(post.id);

    const handleSendComment = async (content: string) => {
        if (!currentUserId) {
            navigate('/login');
            return;
        }
        try {
            if (editingComment) {
                await updateComment({
                    commentId: editingComment.id,
                    content,
                });
                setEditingComment(null);
            } else if (replyingTo) {
                await addComment({
                    postId: post.id,
                    content,
                    parentCommentId: replyingTo.id,
                });
                setReplyingTo(null);
            } else {
                await addComment({
                    postId: post.id,
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
                    <div 
                        className="h-8 w-8 overflow-hidden rounded-full ring-1 ring-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate(`/profile/${post.userId}`)}
                    >
                        {post.avatar ? (
                            <img src={post.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs font-bold text-gray-400">
                                {post.author?.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span 
                                className="text-[14px] font-bold text-[#1E293B] cursor-pointer hover:underline"
                                onClick={() => navigate(`/profile/${post.userId}`)}
                            >
                                {post.author}
                            </span>
                            {!isOwnPost && (
                                <span className="text-[14px] font-bold text-blue-500 hover:text-blue-600 cursor-pointer">
                                    • {t('social.feed.post.actions.follow', { defaultValue: 'Theo dõi' })}
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

            <div className="flex-1 overflow-y-auto scrollbar-hide relative">
                <div className={`divide-y divide-[#F1F5F9]/30 ${!currentUserId ? 'blur-[4px] select-none pointer-events-none' : ''}`}>
                    {post.caption && (
                        <div className="flex gap-3 px-4 py-4">
                            <div 
                                className="h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => navigate(`/profile/${post.userId}`)}
                            >
                                <img src={post.avatar} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="text-[14px]">
                                    <span 
                                        className="font-bold text-[#1E293B] mr-2 cursor-pointer hover:underline"
                                        onClick={() => navigate(`/profile/${post.userId}`)}
                                    >
                                        {post.author}
                                    </span>
                                    <span className="text-[13px] text-[#64748B]">
                                        • {t('social.feed.comments.author', { defaultValue: 'Tác giả' })}
                                    </span>
                                    <div className="text-[#334155] leading-[1.4] whitespace-pre-wrap mt-1">
                                        {post.caption}
                                    </div>
                                </div>
                                <div className="text-[12px] text-[#64748B]">
                                    {post.createdAt && formatDistanceToNow(new Date(post.createdAt), { locale: currentLocale })}
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
                                isAuthor={post.userId === comment.userId}
                                onDelete={(id) => deleteComment(id)}
                                onEdit={(comment) => setEditingComment(comment)}
                                onReply={(comment) => {
                                    setEditingComment(null);
                                    setReplyingTo(comment);
                                }}
                            />
                        ))
                    ) : !post.caption && (
                        <div className="py-20 text-center">
                            <p className="text-sm text-gray-400">{t('social.feed.comments.empty', { defaultValue: 'Chưa có bình luận nào.' })}</p>
                        </div>
                    )}
                </div>

                {!currentUserId && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/20">
                        <div className="text-center p-6 bg-white/80 backdrop-blur-md shadow-xl rounded-2xl border border-white/20 max-w-[280px] mx-4">
                            <p className="text-gray-800 font-medium text-sm mb-4">{t('social.feed.comments.guest.title', { defaultValue: 'Vui lòng đăng nhập để xem thêm' })}</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-45 bg-primary text-white py-2 rounded-xl font-semibold text-sm hover:bg-primary-hover transition-all shadow-lg active:scale-95"
                            >
                                {t('social.feed.comments.guest.loginButton', { defaultValue: 'Đăng nhập ngay' })}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-[#F1F5F9] shrink-0">
                <div className="flex items-center gap-4 px-4 pt-3">
                    <button
                        onClick={() => likePost(post.id)}
                        disabled={isLiking}
                        className={`transition-transform active:scale-125 ${post.isLiked ? 'text-red-500' : 'text-gray-700 hover:text-gray-400'}`}
                    >
                        <Heart className={`h-6 w-6 ${post.isLiked ? 'fill-current' : ''}`} />
                    </button>
                    <button className="text-[#2563EB] hover:text-blue-600 transition-colors">
                        <MessageCircle className="h-6 w-6" />
                    </button>
                    <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="text-[#15803D] hover:text-green-700 transition-colors"
                    >
                        <Share2 className="h-6 w-6" />
                    </button>
                </div>

                <div className="px-4 py-2">
                    {(post.likes > 0 || post.comments > 0 || post.shares > 0) && (
                        <div className="flex items-center justify-between mb-1">
                            <div>
                                {post.likes > 0 && (
                                    <p className="text-[13px] font-semibold text-gray-700">
                                        {post.likes} {t('social.feed.post.likes')}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-4">
                                {post.comments > 0 && (
                                    <p className="text-[13px] text-gray-600">
                                        {post.comments} {t('social.feed.post.comments')}
                                    </p>
                                )}
                                {post.shares > 0 && (
                                    <p className="text-[13px] text-gray-600">
                                        {post.shares} {t('social.feed.post.shares')}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                    <p className="text-[10px] uppercase text-gray-400">
                        {post.timeAgo}
                    </p>
                </div>

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

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                postId={post.id}
            />
        </div>
    );
};
