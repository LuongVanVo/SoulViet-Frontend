import { Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CoinBannerProps } from '@/types';

export const CoinBanner = ({ coinBalance }: CoinBannerProps) => {
	const { t } = useTranslation();

	return (
		<div className="rounded-2xl border border-[#E6D777] bg-[#F5F5E8] px-4 py-3 shadow-sm">
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3C700] text-white">
						<Coins className="h-4 w-4" />
					</div>
					<div>
						<p className="text-xs text-[#7D7F76]">{t('social.feed.wallet.label')}</p>
						<p className="text-3xl leading-none font-semibold text-[#F3C700]">{coinBalance.toLocaleString()}</p>
					</div>
				</div>

				<button
					type="button"
					className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
				>
					{t('social.feed.wallet.action')}
				</button>
			</div>
		</div>
	);
};
