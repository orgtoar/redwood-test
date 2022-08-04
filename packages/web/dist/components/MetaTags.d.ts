/// <reference types="react" />
declare type RobotsParams = 'noindex' | 'index' | 'follow' | 'nofollow' | 'none' | 'noarchive' | 'nocache' | 'nosnippet';
interface MetaTagsProps {
    /**
     * @description
     * og:image by default
     */
    tag?: `og:${string}`;
    /**
     * @description
     * website by default. See https://ogp.me/#types
     */
    ogType?: string;
    ogWidth?: string;
    ogHeight?: string;
    locale?: string;
    /**
     * @description
     * Link to image/video to display when unfurled
     **/
    ogContentUrl?: string;
    /**
     * @description
     * The url to link back to. This must be a canonical (absolute) URL.
     * Use `ogContentUrl` to set the actual image to be displayed
     **/
    ogUrl?: `${'http://' | 'https://'}${string}`;
    contentType?: string;
    /**
     * @description
     * String or array of strings to provide crawlers instructions for how to crawl or index web page content.
     **/
    robots?: RobotsParams | RobotsParams[];
    title?: string;
    description?: string;
    author?: string;
    /**
     * @description
     * Any additional metatags
     */
    children?: React.ReactNode;
}
/**
 * Add commonly used <meta> tags for unfurling/seo purposes
 * using the open graph protocol https://ogp.me/
 * @example
 * <MetaTags title="About Page" ogContentUrl="/static/about-og.png"/>
 */
export declare const MetaTags: (props: MetaTagsProps) => JSX.Element;
export {};
//# sourceMappingURL=MetaTags.d.ts.map