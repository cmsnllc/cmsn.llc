import type { ReactNode } from "react";
import "../pages/index.css";

export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <div className="font-body text-body text-phosphor selection:bg-phosphor selection:text-on-phosphor">
      <header className="mx-auto max-w-content px-4 py-8">
        <a className="font-display text-2xl no-underline" href="/">
          CMSN
        </a>
      </header>
      <main className="mx-auto max-w-content px-4">{children}</main>
      <footer className="mx-auto mt-20 max-w-content px-4 py-8 text-small text-phosphor-muted">
        <div className="border-t-2 border-line-faint pt-8">
          <a className="underline" href="/">
            カミング・スーン合同会社 / Coming Soon LLC
          </a>
        </div>
      </footer>
    </div>
  );
}
