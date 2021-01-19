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
              At Thompson Development Group, we strive to Incorporate our values
              Into our daily practice. We operate our companies based on these
              values, and hope to share similar values with our customers.
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
                  Thompson Development Group strives to improve the world
                  arounds us with each an every one of our products. We aim to
                  spread positivity, hope, and compassion.
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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <ul>
            <li>
              <i class="icofont-check" />
              Ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </li>
            <li>
              <i class="icofont-check" />
              Duis aute irure dolor in reprehenderit in voluptate velit.
            </li>
            <li>
              <i class="icofont-check" />
              Ullam est qui quos consequatur eos accusamus.
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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <p>
            Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
            irure dolor in reprehenderit in voluptate velit esse cillum dolore
            eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
            proident, sunt in culpa qui officia deserunt mollit anim id est
            laborum
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
            Cupiditate placeat cupiditate placeat est ipsam culpa. Delectus quia
            minima quod. Sunt saepe odit aut quia voluptatem hic voluptas dolor
            doloremque.
          </p>
          <ul>
            <li>
              <i class="icofont-check" />
              Ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </li>
            <li>
              <i class="icofont-check" />
              Duis aute irure dolor in reprehenderit in voluptate velit.
            </li>
            <li>
              <i class="icofont-check" />
              Facilis ut et voluptatem aperiam. Autem soluta ad fugiat.
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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <p>
            Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
            irure dolor in reprehenderit in voluptate velit esse cillum dolore
            eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
            proident, sunt in culpa qui officia deserunt mollit anim id est
            laborum
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
          <span>01</span>
          <h4>Errand Apparel</h4>
          <p>
            Ulamco laboris nisi ut aliquip ex ea commodo consequat. Et
            consectetur ducimus vero placeat
          </p>
        </div>

        <div
          class="col-lg-4 col-md-6 content-item"
          data-aos="fade-up"
          data-aos-delay="200">
          <span>02</span>
          <h4>Hap-Bee Canndle Co.</h4>
          <p>
            Dolorem est fugiat occaecati voluptate velit esse. Dicta veritatis
            dolor quod et vel dire leno para dest
          </p>
        </div>

        <div
          class="col-lg-4 col-md-6 content-item"
          data-aos="fade-up"
          data-aos-delay="300">
          <span>03</span>
          <h4>Sassy Sis Illustrations</h4>
          <p>
            Molestiae officiis omnis illo asperiores. Aut doloribus vitae sunt
            debitis quo vel nam quis
          </p>
        </div>

        <div
          class="col-lg-4 col-md-6 content-item"
          data-aos="fade-up"
          data-aos-delay="100">
          <span>04</span>
          <h4>Repellendus molestiae</h4>
          <p>
            Inventore quo sint a sint rerum. Distinctio blanditiis deserunt quod
            soluta quod nam mider lando casa
          </p>
        </div>

        <div
          class="col-lg-4 col-md-6 content-item"
          data-aos="fade-up"
          data-aos-delay="200">
          <span>05</span>
          <h4>Sapiente Magnam</h4>
          <p>
            Vitae dolorem in deleniti ipsum omnis tempore voluptatem. Qui
            possimus est repellendus est quibusdam
          </p>
        </div>

        <div
          class="col-lg-4 col-md-6 content-item"
          data-aos="fade-up"
          data-aos-delay="300">
          <span>06</span>
          <h4>Facilis Impedit</h4>
          <p>
            Quis eum numquam veniam ea voluptatibus voluptas. Excepturi aut
            nostrum repudiandae voluptatibus corporis sequi
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
          Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex
          aliquid fuga eum quidem. Sit sint consectetur velit. Quisquam quos
          quisquam cupiditate. Et nemo qui impedit suscipit alias ea. Quia
          fugiat sit in iste officiis commodi quidem hic quas.
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
