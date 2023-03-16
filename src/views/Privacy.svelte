<script>
    import { link } from "svelte-routing";
    import Navbar from "components/Navbars/SignedOutNavbar.svelte";

    // core components
    import Footer from "components/Footers/Footer.svelte";

    //export let location;
</script>

<style lang="css">
    .editorial {
        display: block;
        width: 100%;
        height: 60px;
        max-height: 60px;
        margin: 0;
        z-index: 5;
        top: 69%;
        position: absolute;
        left: 0px;
        float: left;
    }

    .parallax1 > use {
        animation: move-forever1 10s linear infinite;
    }
    .parallax2 > use {
        animation: move-forever2 8s linear infinite;
    }
    .parallax3 > use {
        animation: move-forever3 6s linear infinite;
    }
    .parallax4 > use {
        animation: move-forever4 4s linear infinite;
    }
    @keyframes move-forever1 {
        0% {
            transform: translate(85px, 0%);
        }
        100% {
            transform: translate(-90px, 0%);
        }
    }
    @keyframes move-forever2 {
        0% {
            transform: translate(-90px, 0%);
        }
        100% {
            transform: translate(85px, 0%);
        }
    }
    @keyframes move-forever3 {
        0% {
            transform: translate(85px, 0%);
        }
        100% {
            transform: translate(-90px, 0%);
        }
    }
    @keyframes move-forever4 {
        0% {
            transform: translate(-90px, 0%);
        }
        100% {
            transform: translate(85px, 0%);
        }
    }
</style>

<div>
    <Navbar />

    <main>
        <div
            class="relative pt-16 pb-32 flex content-center items-center justify-center min-h-screen-75">
            <div
                class="absolute top-0 w-full h-full bg-center bg-cover"
                style="
          background-image: url(https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2088&q=80);
        ">
                <span
                    id="blackOverlay"
                    class="w-full h-full absolute opacity-75 bg-black" />
            </div>
            <div class="container relative mx-auto">
                <div class="items-center flex flex-wrap">
                    <div
                        class="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
                        <div class="pr-12">
                            <h1 class="text-white font-semibold text-5xl">
                                Our Privacy Policy
                            </h1>
                            <p class="mt-4 text-lg text-gray-300">
                                This policy tells you how we manage privacy on
                                our site.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div
                class="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px"
                style="transform: translateZ(0);">
                <svg
                    class="absolute bottom-0 overflow-hidden"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                    version="1.1"
                    viewBox="0 0 2560 100"
                    x="0"
                    y="0">
                    <polygon
                        class="text-white-300 fill-current"
                        style="color: rgba(255, 255, 255, var(--text-opacity));"
                        points="2560 0 2560 100 0 100" />
                </svg>
            </div>
        </div>

        <section class="pt-20 pb-48">
            <svg
                class="editorial"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 24 150 28 "
                preserveAspectRatio="none">
                <defs>
                    <path
                        id="gentle-wave"
                        d="M-160 44c30 0 
    58-18 88-18s
    58 18 88 18 
    58-18 88-18 
    58 18 88 18
    v44h-352z" />
                </defs>
                <g class="parallax1">
                    <use xlink:href="#gentle-wave" x="50" y="3" fill="#fff" />
                </g>
                <g class="parallax2">
                    <use xlink:href="#gentle-wave" x="50" y="0" fill="#fff" />
                </g>

                <g class="parallax4">
                    <use xlink:href="#gentle-wave" x="50" y="6" fill="#fff" />
                </g>
            </svg>

            <div class="container mx-auto px-4">
                <div class="flex flex-wrap justify-center text-center mb-24">
                    <div class="w-full lg:w-6/12 px-4">
                        <h2 class="text-4xl font-semibold">Privacy Policy</h2>
                        <div class="text-lg leading-relaxed m-4 text-gray-600">
                            <p><strong>Effective Date: 03-12-2020</strong></p>
                            <h3 id="a">Your privacy is important to us</h3>
                            <p>
                                It is Thompson Development Group's policy to
                                respect your privacy regarding any information
                                we may collect while operating our website. This
                                Privacy Policy applies to
                                <a href="https://www.thompsondevgroup.com">
                                    www.thompsondevgroup.com</a>
                                (hereinafter, "us", "we", or
                                "www.thompsondevgroup.com"). We respect your
                                privacy and are committed to protecting
                                personally identifiable information you may
                                provide us through the Website. We have adopted
                                this privacy policy ("Privacy Policy") to
                                explain what information may be collected on our
                                Website, how we use this information, and under
                                what circumstances we may disclose the
                                information to third parties. This Privacy
                                Policy applies only to information we collect
                                through the Website and does not apply to our
                                collection of information from other sources.
                            </p>
                            <p>
                                This Privacy Policy, together with the Terms of
                                service posted on our Website, set forth the
                                general rules and policies governing your use of
                                our Website. Depending on your activities when
                                visiting our Website, you may be required to
                                agree to additional terms of service.
                            </p>
                            <h2 id="tableofcontents">Contents</h2>
                            <p>
                                Click below to jump to any section of this
                                privacy policy
                            </p>
                            <ol type="1">
                                <li>
                                    <a href="#websitevisitors"><strong>Website
                                            Visitors</strong></a>
                                </li>
                                <li>
                                    <a
                                        href="#PII"><strong>Personally-Identifying
                                            Information</strong></a>
                                </li>
                                <li>
                                    <a
                                        href="#Security"><strong>Security</strong></a>
                                </li>
                                <li>
                                    <a
                                        href="#Ads"><strong>Advertisements</strong></a>
                                </li>
                                <li>
                                    <a href="#ExternalLinks"><strong>Links To
                                            External Sites</strong></a>
                                </li>
                                <li>
                                    <a href="#Remarketing"><strong>Thompson
                                            Development Group uses Google
                                            AdWords for remarketing</strong></a>
                                </li>
                                <li>
                                    <a href="#PIIProtection"><strong>Protection
                                            of Certain Personally-Identifying
                                            Information</strong></a>
                                </li>
                                <li>
                                    <a href="#Stats"><strong>Aggregated
                                            Statistics</strong></a>
                                </li>
                                <li>
                                    <a href="#Affiliates"><strong>Affiliate
                                            Disclosure</strong></a>
                                </li>
                                <li>
                                    <a
                                        href="#Cookies"><strong>Cookies</strong></a>
                                </li>
                                <li>
                                    <a
                                        href="#Ecommerce"><strong>E-commerce</strong></a>
                                </li>
                                <li>
                                    <a href="#Changes"><strong>Privacy Policy
                                            Changes</strong></a>
                                </li>
                                <li>
                                    <a href="#Credit"><strong>Contact
                                            Information &amp; Credit</strong></a>
                                </li>
                            </ol>
                            <h2 id="websitevisitors">1. Website Visitors</h2>
                            <p>
                                Like most website operators, Thompson
                                Development Group collects
                                non-personally-identifying information of the
                                sort that web browsers and servers typically
                                make available, such as the browser type,
                                language preference, referring site, and the
                                date and time of each visitor request. Thompson
                                Development Group's purpose in collecting
                                non-personally identifying information is to
                                better understand how Thompson Development
                                Group's visitors use its website. From time to
                                time, Thompson Development Group may release
                                non-personally-identifying information in the
                                aggregate, e.g., by publishing a report on
                                trends in the usage of its website.
                            </p>
                            <p>
                                Thompson Development Group also collects
                                potentially personally-identifying information
                                like Internet Protocol (IP) addresses for logged
                                in users and for users leaving comments on
                                https://www.thompsondevgroup.com blog posts.
                                Thompson Development Group only discloses logged
                                in user and commenter IP addresses under the
                                same circumstances that it uses and discloses
                                personally-identifying information as described
                                below.
                            </p>

                            <p>
                                <a href="#tableofcontents">Back to table of
                                    contents</a>
                            </p>
                            <h2 id="PII">
                                2. Personally-Identifying Information
                            </h2>
                            <p>
                                Certain visitors to Thompson Development Group's
                                websites choose to interact with Thompson
                                Development Group in ways that require Thompson
                                Development Group to gather
                                personally-identifying information. The amount
                                and type of information that Thompson
                                Development Group gathers depends on the nature
                                of the interaction. For example, we ask visitors
                                who leave a comment at
                                https://www.thompsondevgroup.com to provide a
                                username and email address.
                            </p>

                            <p>
                                <a href="#tableofcontents">Back to table of
                                    contents</a>
                            </p>
                            <h2 id="Security">3. Security</h2>
                            <p>
                                The security of your Personal Information is
                                important to us, but remember that no method of
                                transmission over the Internet, or method of
                                electronic storage is 100% secure. While we
                                strive to use commercially acceptable means to
                                protect your Personal Information, we cannot
                                guarantee its absolute security.
                            </p>

                            <p>
                                <a href="#tableofcontents">Back to table of
                                    contents</a>
                            </p>
                            <h2 id="Ads">4. Advertisements</h2>
                            <p>
                                Ads appearing on our website may be delivered to
                                users by advertising partners, who may set
                                cookies. These cookies allow the ad server to
                                recognize your computer each time they send you
                                an online advertisement to compile information
                                about you or others who use your computer. This
                                information allows ad networks to, among other
                                things, deliver targeted advertisements that
                                they believe will be of most interest to you.
                                This Privacy Policy covers the use of cookies by
                                Thompson Development Group and does not cover
                                the use of cookies by any advertisers.
                            </p>

                            <p>
                                <a href="#tableofcontents">Back to table of
                                    contents</a>
                            </p>
                            <h2 id="ExternalLinks">
                                5. Links To External Sites
                            </h2>
                            <p>
                                Our Service may contain links to external sites
                                that are not operated by us. If you click on a
                                third party link, you will be directed to that
                                third party's site. We strongly advise you to
                                review the Privacy Policy and terms of service
                                of every site you visit.
                            </p>
                            <p>
                                We have no control over, and assume no
                                responsibility for the content, privacy policies
                                or practices of any third party sites, products
                                or services.
                            </p>

                            <p>
                                <a href="#tableofcontents">Back to table of
                                    contents</a>
                            </p>
                            <h2 id="Remarketing">
                                6. Thompson Development Group uses Google
                                AdWords for remarketing
                            </h2>
                            <p>
                                Thompson Development Group uses the remarketing
                                services to advertise on third party websites
                                (including Google) to previous visitors to our
                                site. It could mean that we advertise to
                                previous visitors who haven't completed a task
                                on our site, for example using the contact form
                                to make an enquiry. This could be in the form of
                                an advertisement on the Google search results
                                page, or a site in the Google Display Network.
                                Third-party vendors, including Google, use
                                cookies to serve ads based on someone's past
                                visits. Of course, any data collected will be
                                used in accordance with our own privacy policy
                                and Google's privacy policy.
                            </p>
                            <p>
                                You can set preferences for how Google
                                advertises to you using the Google Ad
                                Preferences page, and if you want to you can opt
                                out of interest-based advertising entirely by
                                cookie settings or permanently using a browser
                                plugin.
                            </p>

                            <p>
                                <a href="#tableofcontents">Back to table of
                                    contents</a>
                            </p>
                            <h2 id="PIIProtection">
                                7. Protection of Certain Personally-Identifying
                                Information
                            </h2>
                            <p>
                                Thompson Development Group discloses potentially
                                personally-identifying and
                                personally-identifying information only to those
                                of its employees, contractors and affiliated
                                organizations that (i) need to know that
                                information in order to process it on Thompson
                                Development Group's behalf or to provide
                                services available at Thompson Development
                                Group's website, and (ii) that have agreed not
                                to disclose it to others. Some of those
                                employees, contractors and affiliated
                                organizations may be located outside of your
                                home country; by using Thompson Development
                                Group's website, you consent to the transfer of
                                such information to them. Thompson Development
                                Group will not rent or sell potentially
                                personally-identifying and
                                personally-identifying information to anyone.
                                Other than to its employees, contractors and
                                affiliated organizations, as described above,
                                Thompson Development Group discloses potentially
                                personally-identifying and
                                personally-identifying information only in
                                response to a subpoena, court order or other
                                governmental request, or when Thompson
                                Development Group believes in good faith that
                                disclosure is reasonably necessary to protect
                                the property or rights of Thompson Development
                                Group, third parties or the public at large.
                            </p>
                            <p>
                                If you are a registered user of
                                https://www.thompsondevgroup.com and have
                                supplied your email address, Thompson
                                Development Group may occasionally send you an
                                email to tell you about new features, solicit
                                your feedback, or just keep you up to date with
                                what's going on with Thompson Development Group
                                and our products. We primarily use our blog to
                                communicate this type of information, so we
                                expect to keep this type of email to a minimum.
                                If you send us a request (for example via a
                                support email or via one of our feedback
                                mechanisms), we reserve the right to publish it
                                in order to help us clarify or respond to your
                                request or to help us support other users.
                                Thompson Development Group takes all measures
                                reasonably necessary to protect against the
                                unauthorized access, use, alteration or
                                destruction of potentially
                                personally-identifying and
                                personally-identifying information.
                            </p>

                            <p>
                                <a href="#tableofcontents">Back to table of
                                    contents</a>
                            </p>
                            <h2 id="Stats">8. Aggregated Statistics</h2>
                            <p>
                                Thompson Development Group may collect
                                statistics about the behavior of visitors to its
                                website. Thompson Development Group may display
                                this information publicly or provide it to
                                others. However, Thompson Development Group does
                                not disclose your personally-identifying
                                information.
                            </p>

                            <p>
                                <a href="#tableofcontents">Back to table of
                                    contents</a>
                            </p>
                            <h2 id="Affiliates">9. Affiliate Disclosure</h2>
                            <p>
                                This site uses affiliate links and does earn a
                                commission from certain links. This does not
                                affect your purchases or the price you may pay.
                            </p>

                            <p>
                                <a href="#tableofcontents">Back to table of
                                    contents</a>
                            </p>
                            <h2 id="Cookies">10. Cookies</h2>
                            <p>
                                To enrich and perfect your online experience,
                                Thompson Development Group uses "Cookies",
                                similar technologies and services provided by
                                others to display personalized content,
                                appropriate advertising and store your
                                preferences on your computer.
                            </p>
                            <p>
                                A cookie is a string of information that a
                                website stores on a visitor's computer, and that
                                the visitor's browser provides to the website
                                each time the visitor returns. Thompson
                                Development Group uses cookies to help Thompson
                                Development Group identify and track visitors,
                                their usage of https://www.thompsondevgroup.com,
                                and their website access preferences. Thompson
                                Development Group visitors who do not wish to
                                have cookies placed on their computers should
                                set their browsers to refuse cookies before
                                using Thompson Development Group's websites,
                                with the drawback that certain features of
                                Thompson Development Group's websites may not
                                function properly without the aid of cookies.
                            </p>
                            <p>
                                By continuing to navigate our website without
                                changing your cookie settings, you hereby
                                acknowledge and agree to Thompson Development
                                Group's use of cookies.
                            </p>

                            <p>
                                <a href="#tableofcontents">Back to table of
                                    contents</a>
                            </p>
                            <h2 id="Ecommerce">11. E-commerce</h2>
                            <p>
                                Those who engage in transactions with Thompson
                                Development Group – by purchasing Thompson
                                Development Group's services or products, are
                                asked to provide additional information,
                                including as necessary the personal and
                                financial information required to process those
                                transactions. In each case, Thompson Development
                                Group collects such information only insofar as
                                is necessary or appropriate to fulfill the
                                purpose of the visitor's interaction with
                                Thompson Development Group. Thompson Development
                                Group does not disclose personally-identifying
                                information other than as described below. And
                                visitors can always refuse to supply
                                personally-identifying information, with the
                                caveat that it may prevent them from engaging in
                                certain website-related activities.
                            </p>

                            <p>
                                <a href="#tableofcontents">Back to table of
                                    contents</a>
                            </p>
                            <h2 id="Changes">12. Privacy Policy Changes</h2>
                            <p>
                                Although most changes are likely to be minor,
                                Thompson Development Group may change its
                                Privacy Policy from time to time, and in
                                Thompson Development Group's sole discretion.
                                Thompson Development Group encourages visitors
                                to frequently check this page for any changes to
                                its Privacy Policy. Your continued use of this
                                site after any change in this Privacy Policy
                                will constitute your acceptance of such change.
                            </p>
                            <p>
                                <a href="#tableofcontents">Back to table of
                                    contents</a>
                            </p>
                            <h2 id="Credit">13. Contact Information</h2>
                            <p>
                                If you have any questions about our Privacy
                                Policy, please contact us via
                                <a
                                    href="mailto:contact@thompsondevgroup.com">email</a>
                                or
                                <a href="tel:">phone</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>
    <Footer />
</div>
