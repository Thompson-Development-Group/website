<script>
  import { Link } from "svelte-routing";

  // core components
  import IndexNavbar from "components/Navbars/IndexNavbar.svelte";
  import Footer from "components/Footers/Footer.svelte";
  import Hero from "components/Hero/Hero.svelte";

  //export let location;
</script>

<style>
  .team-member {
    display: inline-block;
    margin-left: auto;
    margin-right: auto;
  }
  .site-links {
    font-size: 14px !important;
    text-align: center;
  }
</style>

<IndexNavbar />
<Hero />

<main id="main">
  <section id="about" class="about">
    <div class="container">
      <div class="row no-gutters">
        <div
          class="content col-xl-5 d-flex align-items-stretch"
          data-aos="fade-right">
          <div class="content">
            <h3>Our Values</h3>
            <p>
              At Thompson Development Group, we strive to incorporate our values
              into our daily practice. We operate our company and brands based
              on these values, and hope to share similar values with our
              customers.
            </p>
          </div>
        </div>
        <div class="col-xl-7 d-flex align-items-stretch" data-aos="fade-left">
          <div class="icon-boxes d-flex flex-column justify-content-center">
            <div class="row">
              <div
                class="col-md-6 icon-box"
                data-aos="fade-up"
                data-aos-delay="100">
                <i class="bx bx-receipt" />
                <h4>Quality Products</h4>
                <p>
                  Thompson Development Group is dedicated to creating quality
                  products to ensure we are providing top-of-the-line services.
                </p>
              </div>
              <div
                class="col-md-6 icon-box"
                data-aos="fade-up"
                data-aos-delay="200">
                <i class="bx bx-cube-alt" />
                <h4>Attention to Detail</h4>
                <p>
                  Thompson Development Group focuses on maintaining a
                  detail-oriented approach. We like to consider each avenue to
                  produce the best possible outcome.
                </p>
              </div>
              <div
                class="col-md-6 icon-box"
                data-aos="fade-up"
                data-aos-delay="300">
                <i class="bx bx-images" />
                <h4>Positive Message</h4>
                <p>
                  Thompson Development Group strives to improve the world around
                  us with each an every one of our products. We aim to spread
                  positivity, hope, and compassion.
                </p>
              </div>
              <div
                class="col-md-6 icon-box"
                data-aos="fade-up"
                data-aos-delay="400">
                <i class="bx bx-shield" />
                <h4>Commitment to Customers</h4>
                <p>
                  Thompson Development Group advocates strongly on behalf of our
                  customers and strives to ensure quality service. Our
                  client-focused model reminds us, and our customers, that our
                  brand is driven by partnership.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="features" class="features" data-aos="fade-up">
    <div class="container">
      <div class="section-title">
        <h2>Company Features</h2>
        <p>
          Thompson Development Group prides itself in the way that we provide a
          variety of services with a variety of services. Ranging from
          programming to graphic design and marketing to handmade craft creation
          to digital illustration - we've got it all.
        </p>
      </div>

      <div class="row content">
        <div class="col-md-5" data-aos="fade-right" data-aos-delay="100">
          <img src="assets/img/features-1.png" class="img-fluid" alt="" />
        </div>
        <div class="col-md-7 pt-4" data-aos="fade-left" data-aos-delay="100">
          <h3>Software Architecture</h3>
          <p class="font-italic">
            We build each of the applications that we work on to scale. We
            specialize in micro-services, custom frameworks, and full server
            stacks
          </p>
          <ul>
            <li>
              <i class="icofont-check" />
              Languages we have used: NodeJS, Java, Dart, Svelte, PHP
            </li>
            <li>
              <i class="icofont-check" />
              Datastores we use: MongoDB, and various SQL options
            </li>
            <li>
              <i class="icofont-check" />
              Infrastructures we use: AWS, Heroku, Azure, and Google Cloud
            </li>
          </ul>
        </div>
      </div>

      <div class="row content">
        <div class="col-md-5 order-1 order-md-2" data-aos="fade-left">
          <img src="assets/img/features-2.png" class="img-fluid" alt="" />
        </div>
        <div class="col-md-7 pt-5 order-2 order-md-1" data-aos="fade-right">
          <h3>Graphic Design & Marketing</h3>
          <p class="font-italic">
            Creating specialized graphic designs and developing marketing tools
            is one of our specialties at Thompson Development Group.
          </p>
          <p>
            We strive to create eye-catching, meaningful, detail-oriented, and
            one-of-a-kind spreads to help our customers display the brands they
            know and love. We hope to make personalized marketing plans and
            offer custom content creation.
          </p>
        </div>
      </div>

      <div class="row content">
        <div class="col-md-5" data-aos="fade-right">
          <img src="assets/img/features-3.png" class="img-fluid" alt="" />
        </div>
        <div class="col-md-7 pt-5" data-aos="fade-left">
          <h3>Handmade Products</h3>
          <p>
            Thompson Development Group works hard to provide quality products to
            its customers. That’s why we like to create as many of our products
            as we can by hand.
          </p>
          <p>
            We hope to ensure the highest quality products and we enjoy putting
            our own blood, sweat, and tears into our product development
          </p>
          <ul>
            <li>
              <i class="icofont-check" />
              Handmade Candles: 100% Soy Wax, hand-poured, hand-stirred, and
              hand-packaged
            </li>
            <li>
              <i class="icofont-check" />
              Handmade Apparel: High-quality clothing and accessors,
              hand-pressed with the finest materials
            </li>
            <li>
              <i class="icofont-check" />
              Hand-drawn illustrations: Digital drawings and illustrations
              crafted with the finest care
            </li>
          </ul>
        </div>
      </div>

      <div class="row content">
        <div class="col-md-5 order-1 order-md-2" data-aos="fade-left">
          <img src="assets/img/features-4.png" class="img-fluid" alt="" />
        </div>
        <div class="col-md-7 pt-5 order-2 order-md-1" data-aos="fade-right">
          <h3>Digital Design & Illustration</h3>
          <p class="font-italic">
            Thompson Development Groups aims to showcase many talents. Our own
            Chief Operating Officer spends hours designing and drawing intricate
            digital illustrations. Through following customer desires and
            utilizing individual taste, our COO is able to create digital
            masterpieces.
          </p>
          <p>
            With a specialty in digital portraits, designs, and communication,
            Thompson Development Group is able to spread their mission, their
            positivity, and their hope through digital esign and illustration.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section id="steps" class="steps">
    <div class="container">
      <div class="row no-gutters" data-aos="fade-up">
        <div
          class="col-lg-4 col-md-6 content-item"
          data-aos="fade-up"
          data-aos-delay="100">
          <span><img
              src="/assets/img/errand-logo.png"
              alt="Errand Apparel"
              style="width: 80px; margin-left: auto;margin-right: auto;zoom: 1.9;" /></span>
          <h4 style="text-align: center;">Errand Apparel</h4>
          <p>
            <span class="site-links"><a
                href="https://www.errandapparel.com">Shop Custom Apparel</a></span>
            Quality hand-made products ranging from t-shirts, sweatshirts,
            backpacks, mugs, tumblers and more! Errand Apparel creates
            customizable content for individual wear and use!
          </p>
        </div>

        <div
          class="col-lg-4 col-md-6 content-item"
          data-aos="fade-up"
          data-aos-delay="200">
          <span style="overflow: hidden;
    max-height: 145px;"><img
              src="/assets/img/hapbee-logo.png"
              alt="Hap-Bee Candle Co."
              style="width: 120px; margin-left: auto;margin-right: auto; zoom: 1.9;margin-top: -14px;" /></span>
          <h4 style="text-align: center;">Hap-Bee Candle Co.</h4>
          <p>
            <span class="site-links"><a href="https://www.hap-bee.com">Shop
                Candles</a></span>
            Using 100% Soy-Wax, Hap-Bee Candle Co. hand-pours quality candles
            with strong and soothing aromas. Hap-Bee Candle Co. offers a 12-oz
            candle, a 6-oz candle, and wax melts with this custom brand!
          </p>
        </div>

        <div
          class="col-lg-4 col-md-6 content-item"
          data-aos="fade-up"
          data-aos-delay="300">
          <span><img
              src="/assets/img/sassy-logo.png"
              alt="Sassy Sis Illustrations"
              style="width: 120px; margin-left: auto;margin-right: auto; zoom: 1.5;margin-top: -15px;" /></span>
          <h4 style="text-align: center;">Sassy Sister</h4>
          <p>
            The Sassy Sister started as a hobby and has quickly turned into a
            passion. While bringing reality to life with digital creations, this
            brand aims to create customized snapshots into the lives and stories
            of its customers.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section id="services" class="services">
    <div class="container" data-aos="fade-up">
      <div class="section-title">
        <h2>Services</h2>
        <p>
          We create a personal experience with a professional attitude. We will
          go above and beyond to make your ideas come to life.
        </p>
      </div>

      <div class="row">
        <div
          class="col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0"
          data-aos="fade-up"
          data-aos-delay="100">
          <div class="icon-box">
            <div class="icon"><i class="bx bxl-dribbble" /></div>
            <h4 class="title"><a href="/">Product Development</a></h4>
            <p class="description">
              We create awesome brands that people love and have fun doing so.
            </p>
          </div>
        </div>

        <div
          class="col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0"
          data-aos="fade-up"
          data-aos-delay="200">
          <div class="icon-box">
            <div class="icon"><i class="bx bx-file" /></div>
            <h4 class="title"><a href="/">Testing Professionals</a></h4>
            <p class="description">
              We can provide clients with full-fledged unit tests, and various
              automated frameworks which allow the company to thrive and provide
              the ability to put engineers back on development
            </p>
          </div>
        </div>

        <div
          class="col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0"
          data-aos="fade-up"
          data-aos-delay="300">
          <div class="icon-box">
            <div class="icon"><i class="bx bx-tachometer" /></div>
            <h4 class="title"><a href="/">Application Development</a></h4>
            <p class="description">
              We provide the ability to bring your ideas to the client's
              browsers
            </p>
          </div>
        </div>

        <div
          class="col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0"
          data-aos="fade-up"
          data-aos-delay="400">
          <div class="icon-box">
            <div class="icon"><i class="bx bx-layer" /></div>
            <h4 class="title"><a href="/">Graphic Design</a></h4>
            <p class="description">
              We give your ideas a look and feel that everyone will love
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="team" class="team">
    <div class="container" data-aos="fade-up">
      <div class="section-title">
        <h2>Team</h2>
        <p>
          Our team is made up of two goal-oriented entrepreneurs who are
          dedicated to deliver the very best products. No matter what challenges
          arise, we provide detail-driven results, from service conception to
          production.
        </p>
      </div>

      <div class="row">
        <div
          class="col-xl-3 col-lg-2 col-md-6"
          data-aos="fade-up"
          data-aos-delay="100">
          <div class="member team-member">
            <img src="assets/img/team/team-1.png" class="img-fluid" alt="" />
            <div class="member-info">
              <div class="member-info-content">
                <h4>Tyler Thompson</h4>
                <span>Chief Executive Officer</span>
              </div>
              <div class="social">
                <a href="/"><i class="icofont-twitter" /></a>
                <a href="/"><i class="icofont-facebook" /></a>
                <a href="/"><i class="icofont-instagram" /></a>
                <a href="/"><i class="icofont-linkedin" /></a>
              </div>
            </div>
          </div>
        </div>

        <div
          class="col-xl-3 col-lg-2 col-md-6"
          data-aos="fade-up"
          data-aos-delay="200">
          <div class="member team-member">
            <img src="assets/img/team/team-2.jpg" class="img-fluid" alt="" />
            <div class="member-info">
              <div class="member-info-content">
                <h4>Hannah Anderson</h4>
                <span>Cheif Operating Officer</span>
              </div>
              <div class="social">
                <a href="/"><i class="icofont-twitter" /></a>
                <a href="/"><i class="icofont-facebook" /></a>
                <a href="/"><i class="icofont-instagram" /></a>
                <a href="/"><i class="icofont-linkedin" /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="contact" class="contact section-bg">
    <div class="container" data-aos="fade-up">
      <div class="section-title">
        <h2>Contact</h2>
        <p>
          Contact us if you have a need for one of our services! We will get
          back to you in 1-2 business days. Please, No soliciting, We have a
          very strict no Solicitation policy
        </p>
      </div>

      <div class="row">
        <div class="col-lg-6">
          <div class="row">
            <div class="col-md-12">
              <div class="info-box">
                <i class="bx bx-map" />
                <h3>Our City</h3>
                <p>Madison, WI 53713</p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-box mt-4">
                <i class="bx bx-envelope" />
                <h3>Email Us</h3>
                <p>
                  info@thompsondevgroup.com<br />contact@thompsondevgroup.com
                </p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-box mt-4">
                <i class="bx bx-phone-call" />
                <h3>Call Us</h3>
                <p><br />+1 ‪(608) 313-4806‬</p>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-6 mt-4 mt-md-0">
          <form
            action="forms/contact.php"
            method="post"
            role="form"
            class="php-email-form">
            <div class="row">
              <div class="col-md-6 form-group">
                <input
                  type="text"
                  name="name"
                  class="form-control"
                  id="name"
                  placeholder="Your Name"
                  data-rule="minlen:4"
                  data-msg="Please enter at least 4 chars" />
                <div class="validate" />
              </div>
              <div class="col-md-6 form-group mt-3 mt-md-0">
                <input
                  type="email"
                  class="form-control"
                  name="email"
                  id="email"
                  placeholder="Your Email"
                  data-rule="email"
                  data-msg="Please enter a valid email" />
                <div class="validate" />
              </div>
            </div>
            <div class="form-group mt-3">
              <input
                type="text"
                class="form-control"
                name="subject"
                id="subject"
                placeholder="Subject"
                data-rule="minlen:4"
                data-msg="Please enter at least 8 chars of subject" />
              <div class="validate" />
            </div>
            <div class="form-group mt-3">
              <textarea
                class="form-control"
                name="message"
                rows="5"
                data-rule="required"
                data-msg="Please write something for us"
                placeholder="Message" />
              <div class="validate" />
            </div>
            <div class="mb-3">
              <div class="loading">Loading</div>
              <div class="error-message" />
              <div class="sent-message">
                Your message has been sent. Thank you!
              </div>
            </div>
            <div class="text-center">
              <button type="submit">Send Message</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</main>

<Footer />
