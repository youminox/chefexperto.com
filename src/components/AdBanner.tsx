export default function AdBanner() {
  return (
    <div className="w-full my-8 text-center overflow-hidden flex justify-center">
      <div className="min-h-[90px] w-full max-w-[728px] mx-auto bg-gray-50 border border-gray-100 flex items-center justify-center rounded">
        {/* AdSense auto ads code container */}
        <ins 
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" 
          data-ad-slot="XXXXXXXXXX"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
