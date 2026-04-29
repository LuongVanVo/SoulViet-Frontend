import { MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface MarketplaceLocalPartnerCardProps {
  name?: string
  subtitle?: string
  avatarUrl?: string
  onChatClick?: () => void
}

export const MarketplaceLocalPartnerCard = ({
  name,
  subtitle,
  avatarUrl,
  onChatClick,
}: MarketplaceLocalPartnerCardProps) => {
  const { t } = useTranslation()
  const resolvedName = name ?? t('marketplace.detail.partner.defaultName')
  const resolvedSubtitle = subtitle ?? t('marketplace.detail.partner.defaultSubtitle')

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
        <div className="h-11 w-11 overflow-hidden rounded-full bg-gray-100">
        {avatarUrl ? (
            <img
            src={avatarUrl}
            alt={name}
            className="h-full w-full object-cover"
            onError={(e) => {
                e.currentTarget.src =
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&q=80'
            }}
            />
        ) : (
            <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&q=80"
            alt={name}
            className="h-full w-full object-cover"
            />
        )}
        </div>

          <div>
            <p className="text-base font-extrabold text-gray-900">
              {t('marketplace.detail.partner.hostedBy', { name: resolvedName })}
            </p>
            <p className="text-xs text-gray-500">{resolvedSubtitle}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onChatClick}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <MessageCircle className="h-4 w-4" />
          {t('marketplace.detail.partner.chatWithHost')}
        </button>
      </div>
    </div>
  )
}