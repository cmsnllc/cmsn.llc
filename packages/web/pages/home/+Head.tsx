const GA_ID = "UA-132382103-1";

export function Head() {
  return (
    <>
      <meta name="google-site-verification" content="P_uOBd3jYaeThcRX15ayu3cldmv-GXTCIBy31WDmRjI" />
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`,
        }}
      />
    </>
  );
}
