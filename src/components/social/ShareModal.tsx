import { useState, useRef, useEffect, type ReactNode } from 'react';
import { ChevronRight, ChevronLeft, Smile } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faEnvelope, faX} from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faFacebookMessenger, faWhatsapp, faThreads, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store';
import { useSharePost } from '@/hooks';
import { ShareType } from '@/types';
import toast from 'react-hot-toast';

interface ShareModalProps {
	isOpen: boolean;
	onClose: () => void;
	postId?: string;
	postUrl?: string;
}

interface ShareOption {
	id: string;
	label: string;
	labelKey: string;
	icon: ReactNode;
}

export const ShareModal = ({ isOpen, onClose, postId, postUrl = window.location.href }: ShareModalProps) => {
	const { t } = useTranslation();
	const currentUser = useAuthStore((state) => state.user);
	const { sharePost, isLoading } = useSharePost();
	const scrollRef = useRef<HTMLDivElement>(null);
	const [shareMessage, setShareMessage] = useState('');
	const [showLeftArrow, setShowLeftArrow] = useState(false);
	const [showRightArrow, setShowRightArrow] = useState(false);

	const checkScroll = () => {
		if (scrollRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
			const isAtStart = scrollLeft < 5;
			const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 5;
			setShowLeftArrow(!isAtStart);
			setShowRightArrow(!isAtEnd);
		}
	};

	useEffect(() => {
		if (!isOpen) return;

		const current = scrollRef.current;
		if (current) {
			current.scrollTo({ left: 0, behavior: 'auto' });
			setShowLeftArrow(false);
			setShowRightArrow(false);
			setShareMessage('');
			current.addEventListener('scroll', checkScroll);
			window.addEventListener('resize', checkScroll);

			const timer = setTimeout(checkScroll, 50);

			return () => {
				current.removeEventListener('scroll', checkScroll);
				window.removeEventListener('resize', checkScroll);
				clearTimeout(timer);
			};
		}
	}, [isOpen]);

	if (!isOpen) return null;

	const shareText = t('social.feed.shareModal.shareText', {
		defaultValue: t('social.feed.header.title')
	});
	const userName = currentUser?.name || t('social.feed.shareModal.defaultUserName');
	const userAvatar = currentUser?.avatarUrl;
	const userInitials = userName
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join('');

	const shareOptions: ShareOption[] = [
		{ id: 'copy', label: t('social.feed.post.share.copy', { defaultValue: 'Sao chép liên kết' }), labelKey: 'social.feed.post.share.copy', icon: <FontAwesomeIcon icon={faLink} /> },
		{
			id: 'facebook',
			label: t('social.feed.post.share.facebook', { defaultValue: 'Facebook' }),
			labelKey: 'social.feed.post.share.facebook',
			icon: (
				<FontAwesomeIcon icon={faFacebook} />
			)
		},
		{
			id: 'messenger',
			label: t('social.feed.post.share.messenger', { defaultValue: 'Messenger' }),
			labelKey: 'social.feed.post.share.messenger',
			icon: (
				<FontAwesomeIcon icon={faFacebookMessenger} />
			)
		},
		{
			id: 'whatsapp',
			label: t('social.feed.post.share.whatsapp', { defaultValue: 'WhatsApp' }),
			labelKey: 'social.feed.post.share.whatsapp',
			icon: (
				<FontAwesomeIcon icon={faWhatsapp} />
			)
		},
		{ id: 'email', label: t('social.feed.post.share.email', { defaultValue: 'Email' }), labelKey: 'social.feed.post.share.email', icon: <FontAwesomeIcon icon={faEnvelope} /> },
		{
			id: 'threads',
			label: t('social.feed.post.share.threads', { defaultValue: 'Threads' }),
			labelKey: 'social.feed.post.share.threads',
			icon: (
				<FontAwesomeIcon icon={faThreads} />
			)
		},
		{
			id: 'x',
			label: t('social.feed.post.share.x', { defaultValue: 'X' }),
			labelKey: 'social.feed.post.share.x',
			icon: (
				<FontAwesomeIcon icon={faXTwitter} />
			)
		},
	];

	const handleCopyLink = () => {
		const textToCopy = shareMessage.trim() ? `${shareMessage.trim()}\n${postUrl}` : postUrl;
		navigator.clipboard.writeText(textToCopy);
	};

	const openShareWindow = (url: string) => {
		window.open(url, '_blank', 'noopener,noreferrer');
	};

	const handleShare = (optionId: string) => {
		const encodedUrl = encodeURIComponent(postUrl);
		const encodedText = encodeURIComponent(shareText);

		switch (optionId) {
			case 'copy':
				handleCopyLink();
				return;
			case 'facebook':
				openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`);
				return;
			case 'messenger':
				openShareWindow(`https://www.messenger.com/share?link=${encodedUrl}`);
				return;
			case 'whatsapp':
				openShareWindow(`https://wa.me/?text=${encodedText}%20${encodedUrl}`);
				return;
			case 'email':
				window.location.href = `mailto:?subject=${encodedText}&body=${encodedUrl}`;
				return;
			case 'threads':
				openShareWindow(`https://www.threads.net/intent/post?text=${encodedText}%20${encodedUrl}`);
				return;
			case 'x':
				openShareWindow(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`);
				return;
			default:
				return;
		}
	};

	const handleShareToTimeline = () => {
		if (!postId) {
			toast.error('Post ID is missing');
			return;
		}

		sharePost(
			{
				postId,
				payload: {
					caption: shareMessage || undefined,
					shareType: ShareType.Timeline,
				},
			},
			{
				onSuccess: () => {
					toast.success('Posted to your timeline!');
					onClose();
					setShareMessage('');
				},
				onError: (error: Error) => {
					toast.error(error.message || 'Failed to share post');
				},
			}
		);
	};

	const scroll = (direction: 'left' | 'right') => {
		if (scrollRef.current) {
			const scrollAmount = direction === 'left' ? -240 : 240;
			scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
		}
	};

	const handleSendNow = () => {
		if (!postId) {
			toast.error('Post ID is missing');
			return;
		}
		handleShareToTimeline();
	};

	return (
		<div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:p-4" onClick={onClose}>
			<div
				className="w-full max-w-[560px] overflow-hidden rounded-t-[32px] bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-200 sm:rounded-[32px]"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex justify-center pt-3 sm:hidden">
					<div className="h-1.5 w-14 rounded-full bg-gray-200" />
				</div>

				<div className="relative flex items-center justify-center px-6 pb-3 pt-4 sm:pt-5">
					<button
						onClick={onClose}
						className="absolute right-4 top-3 rounded-full p-2 transition-colors hover:bg-gray-100 sm:right-5 sm:top-4"
						aria-label={t('social.feed.shareModal.close')}
					>
						<FontAwesomeIcon icon={faX} size="lg" className="text-gray-900" />
					</button>
					<div className="text-center">
						<h2 className="text-[18px] font-semibold tracking-tight text-gray-900">
							{t('social.feed.shareModal.title')}
						</h2>
						<p className="mt-1 text-[13px] text-gray-500">
							{t('social.feed.shareModal.subtitle')}
						</p>
					</div>
				</div>

				<div className="border-t border-gray-200 px-4 pb-5 pt-4 sm:px-6">
					<div className="flex items-start gap-3">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E2E8F0] text-sm font-semibold text-[#0F172A]">
							{userAvatar ? (
								<img src={userAvatar} alt={userName} className="h-full w-full object-cover" />
							) : (
								<span>{userInitials || 'U'}</span>
							)}
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex items-center gap-3">
								<p className="truncate text-[17px] font-semibold text-gray-900">{userName}</p>
							</div>
							<textarea
								value={shareMessage}
								onChange={(e) => setShareMessage(e.target.value)}
								placeholder={t('social.feed.shareModal.placeholder')}
								rows={3}
								className="mt-3 w-full resize-none border-none bg-transparent p-0 text-[15px] leading-6 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-0"
							/>
							<div className="mt-2 flex items-center justify-end">
								<button
									type="button"
									className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
									aria-label={t('social.feed.shareModal.emojiLabel')}
								>
									<Smile size={20} />
								</button>
							</div>
						</div>
					</div>

					<div className="mt-4 flex justify-end">
						<button
							type="button"
							onClick={handleSendNow}
							disabled={isLoading}
							className="rounded-xl bg-[#1877F2] px-7 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#166FE5] disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? t('social.feed.shareModal.posting', { defaultValue: 'Posting...' }) : t('social.feed.shareModal.sendNow')}
						</button>
					</div>

				</div>
				<div className="px-6 pt-1 pb-4">
					<div className="-mx-6 h-px bg-gray-200" />
				</div>
				<div className="relative px-3 pb-1 pt-3 sm:px-3 sm:pb-3">
					<button
						onClick={() => scroll('left')}
						className={`absolute left-2 top-[calc(40%-16px)] z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#64748B] text-white shadow-md transition-all hover:bg-[#475569] md:flex ${!showLeftArrow ? 'pointer-events-none scale-90 opacity-0' : 'scale-100 opacity-100'}`}
					>
						<ChevronLeft size={16} />
					</button>

					<div
						ref={scrollRef}
						onScroll={checkScroll}
						className="flex items-start gap-4 overflow-x-auto scroll-smooth px-2 pb-1 scrollbar-hide"
					>
						{shareOptions.map((option) => (
							<button
								key={option.id}
								onClick={() => handleShare(option.id)}
								className="group flex shrink-0 flex-col items-center gap-2.5"
								aria-label={option.label}
								title={option.label}
							>
								<div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#F1F5F9] text-[#0F172A] transition-all active:scale-95 group-hover:bg-[#E2E8F0]">
									<span className="text-[22px]">
										{option.icon}
									</span>
								</div>
								<span className="w-[82px] text-center text-[12px] font-medium leading-tight text-[#334155]">
									{option.label}
								</span>
							</button>
						))}
					</div>

					<button
						onClick={() => scroll('right')}
						className={`absolute right-2 top-[calc(40%-16px)] z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#64748B] text-white shadow-md transition-all hover:bg-[#475569] md:flex ${!showRightArrow ? 'pointer-events-none scale-90 opacity-0' : 'scale-100 opacity-100'}`}
					>
						<ChevronRight size={16} />
					</button>
				</div>
			</div>
		</div>
	);
};
