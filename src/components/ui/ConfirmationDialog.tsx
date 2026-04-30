import type { ReactNode } from 'react';

interface ConfirmationDialogProps {
	isOpen: boolean;
	title: ReactNode;
	message: ReactNode;
	cancelLabel: ReactNode;
	confirmLabel: ReactNode;
	loadingLabel?: ReactNode;
	isLoading?: boolean;
	variant?: 'default' | 'danger';
	onCancel: () => void;
	onConfirm: () => void;
}

export const ConfirmationDialog = ({
	isOpen,
	title,
	message,
	cancelLabel,
	confirmLabel,
	loadingLabel,
	isLoading = false,
	variant = 'danger',
	onCancel,
	onConfirm,
}: ConfirmationDialogProps) => {
	if (!isOpen) {
		return null;
	}

	const confirmButtonClassName =
		variant === 'danger'
			? 'bg-[#DC2626] text-white hover:bg-[#B91C1C]'
			: 'bg-[#1F58A5] text-white hover:bg-[#174888]';

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={onCancel}>
			<div 
				className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
				onClick={(e) => e.stopPropagation()}
			>
				<h3 className="text-lg font-semibold text-[#111827]">{title}</h3>
				<p className="mt-2 text-sm text-[#4B5563]">{message}</p>
				<div className="mt-5 flex justify-end gap-3">
					<button
						type="button"
						onClick={onCancel}
						disabled={isLoading}
						className="rounded-lg border border-[#D1D5DB] px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-70"
					>
						{cancelLabel}
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={isLoading}
						className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70 ${confirmButtonClassName}`}
					>
							{isLoading ? loadingLabel ?? confirmLabel : confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
};