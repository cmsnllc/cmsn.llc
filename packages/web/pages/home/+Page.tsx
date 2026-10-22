import "../index.css";

const CONTACT_FORM =
  "https://docs.google.com/forms/d/e/1FAIpQLSfNQuHOqq9kpgwB60g0Y2dWIPI-Vgg4912fE9fbPyj_V--uVw/viewform?embedded=true";

export default function Page() {
  return (
    <div className="m-2 font-[serif] text-phosphor">
      <header className="mb-120 box-content p-40">
        <h1 className="m-0 text-center font-display text-wordmark leading-none font-bold">CM</h1>
        <h1 className="m-0 text-center font-display text-wordmark leading-none font-bold">SN</h1>
      </header>
      <article>
        <dl className="mx-auto grid grid-cols-[1fr_2fr] gap-4 p-20 text-info leading-[normal] [&_dd]:ml-10 [&_dt]:font-bold">
          <dt>会社名 / Name</dt>
          <dd>カミング・スーン合同会社 / Coming Soon LLC</dd>
          <dt>設立 / Founded</dt>
          <dd>2018/11/01</dd>
          <dt>所在地 / HQ</dt>
          <dd>神奈川県川崎市高津区下作延7-14-6-2</dd>
          <dt>代表者 / Founder</dt>
          <dd>
            小林貴也 / Takaya Kobayashi (
            <a className="underline" href="https://jgs.me">
              https://jgs.me
            </a>
            )
          </dd>
          <dt>事業内容 / Industry</dt>
          <dd>インターネット / Internet, テクノロジー / Technology</dd>
          <dt>資本金 / Capital</dt>
          <dd>50万円 / &yen;500K</dd>
        </dl>
        <h2 className="my-[0.83em] text-center text-heading leading-[normal] font-bold">お問い合わせ / Contact</h2>
        <div className="mx-auto box-content h-240 w-[80vw] pb-80">
          <iframe className="inline bg-embed-bg" src={CONTACT_FORM} width="100%" height="100%" frameBorder={0} marginHeight={0} marginWidth={0}>
            読み込んでいます…
          </iframe>
        </div>
      </article>
    </div>
  );
}
