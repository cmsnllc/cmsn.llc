import { PixelMark } from "../../components/PixelMark";
import { LANGS, navOf } from "../../content";
import "../index.css";

export default function Page() {
  return (
    <div className="crt font-[serif] text-phosphor">
      <header className="flex justify-center px-4 pt-20 pb-16 sm:pt-32">
        <h1 className="m-0">
          <PixelMark label="CMSN" className="block w-[min(88vw,40rem)]" />
        </h1>
      </header>
      <nav className="pb-80">
        {LANGS.map((lang) => (
          <ul key={lang} lang={lang} className="mb-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-2xl sm:gap-x-10">
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
