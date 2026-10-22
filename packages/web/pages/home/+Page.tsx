import { LANGS, navOf } from "../../content";
import "../index.css";

export default function Page() {
  return (
    <div className="m-2 font-[serif] text-phosphor">
      <header className="mb-40 box-content p-40">
        <h1 className="m-0 text-center font-display text-wordmark leading-none font-bold">CM</h1>
        <h1 className="m-0 text-center font-display text-wordmark leading-none font-bold">SN</h1>
      </header>
      <nav className="pb-80">
        {LANGS.map((lang) => (
          <ul key={lang} lang={lang} className="mb-6 flex flex-wrap justify-center gap-x-10 gap-y-2 text-2xl">
            {navOf(lang).map((n) => (
              <li key={n.slug}>
                <a className="underline" href={n.path}>
                  {n.title}
                </a>
              </li>
            ))}
          </ul>
        ))}
      </nav>
    </div>
  );
}
