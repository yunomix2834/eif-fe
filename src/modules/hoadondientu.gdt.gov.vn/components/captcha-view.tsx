import { Button } from "@global/components/button";

function createSvgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function CaptchaView({
  svg,
  isLoading,
  onReload,
}: {
  svg: string | undefined;
  isLoading: boolean;
  onReload: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="grid min-h-14 min-w-[216px] place-items-center rounded-xl border border-[var(--border)] bg-white px-2 py-1">
        {svg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={createSvgDataUri(svg)}
            alt="Captcha Hóa đơn điện tử"
            className="max-h-12 max-w-[210px]"
          />
        ) : (
          <span className="text-xs text-slate-500">Chưa có captcha</span>
        )}
      </div>
      <Button
        type="button"
        variant="secondary"
        isBusy={isLoading}
        onClick={onReload}
      >
        Captcha mới
      </Button>
    </div>
  );
}
