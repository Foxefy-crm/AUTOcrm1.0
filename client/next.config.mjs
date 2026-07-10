/** @type {import('next').NextConfig} */
const nextConfig = {
  // Purely cosmetic: hides the small route-info badge Next.js shows in dev
  // mode. NOTE: this does NOT suppress error/warning overlays — those are a
  // separate, always-on mechanism with no config to disable (confirmed by
  // testing). The real fix for the "[antd: Menu] children is deprecated"
  // warning that used to trigger that overlay was to stop using
  // @refinedev/antd's default sidebar at all — see components/AppSider.js.
  devIndicators: false,
};

export default nextConfig;
