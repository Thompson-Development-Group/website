<script>
  import { Link } from "svelte-routing";

  // core components
  import IndexNavbar from "components/Navbars/IndexNavbar.svelte";
  import Footer from "components/Footers/Footer.svelte";
  import Hero from "components/Hero/Hero.svelte";

  export let location;
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
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Duis
              aute irure dolor in reprehenderit
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
                <h4>Corporis voluptates sit</h4>
                <p>
                  Consequuntur sunt aut quasi enim aliquam quae harum pariatur
                  laboris nisi ut aliquip
                </p>
              </div>
              <div
                class="col-md-6 icon-box"
                data-aos="fade-up"
                data-aos-delay="200">
                <i class="bx bx-cube-alt" />
                <h4>Ullamco laboris nisi</h4>
                <p>
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa
                  qui officia deserunt
                </p>
              </div>
              <div
                class="col-md-6 icon-box"
                data-aos="fade-up"
                data-aos-delay="300">
                <i class="bx bx-images" />
                <h4>Labore consequatur</h4>
                <p>
                  Aut suscipit aut cum nemo deleniti aut omnis. Doloribus ut
                  maiores omnis facere
                </p>
              </div>
              <div
                class="col-md-6 icon-box"
                data-aos="fade-up"
                data-aos-delay="400">
                <i class="bx bx-shield" />
                <h4>Beatae veritatis</h4>
                <p>
                  Expedita veritatis consequuntur nihil tempore laudantium vitae
                  denat pacta
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
        <h2>Features</h2>
        <p>
          Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex
          aliquid fuga eum quidem. Sit sint consectetur velit. Quisquam quos
          quisquam cupiditate. Et nemo qui impedit suscipit alias ea. Quia
          fugiat sit in iste officiis commodi quidem hic quas.
        </p>
      </div>

      <div class="row content">
        <div class="col-md-5" data-aos="fade-right" data-aos-delay="100">
          <img src="assets/img/features-1.png" class="img-fluid" alt="" />
        </div>
        <div class="col-md-7 pt-4" data-aos="fade-left" data-aos-delay="100">
          <h3>
            Voluptatem dignissimos provident quasi corporis voluptates sit
            assumenda.
          </h3>
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
          <h3>Corporis temporibus maiores provident</h3>
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
          <h3>
            Sunt consequatur ad ut est nulla consectetur reiciendis animi
            voluptas
          </h3>
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
          <h3>
            Quas et necessitatibus eaque impedit ipsum animi consequatur
            incidunt in
          </h3>
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
          <h4>Lorem Ipsum</h4>
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
          <h4>Repellat Nihil</h4>
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
          <h4>Ad ad velit qui</h4>
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
            <h4 class="title"><a href="">Product Development</a></h4>
            <p class="description">we create awesome brands</p>
          </div>
        </div>

        <div
          class="col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0"
          data-aos="fade-up"
          data-aos-delay="200">
          <div class="icon-box">
            <div class="icon"><i class="bx bx-file" /></div>
            <h4 class="title"><a href="">Testing Professionals</a></h4>
            <p class="description">
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore
            </p>
          </div>
        </div>

        <div
          class="col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0"
          data-aos="fade-up"
          data-aos-delay="300">
          <div class="icon-box">
            <div class="icon"><i class="bx bx-tachometer" /></div>
            <h4 class="title"><a href="">Application Development</a></h4>
            <p class="description">
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
              officia
            </p>
          </div>
        </div>

        <div
          class="col-md-6 col-lg-3 d-flex align-items-stretch mb-5 mb-lg-0"
          data-aos="fade-up"
          data-aos-delay="400">
          <div class="icon-box">
            <div class="icon"><i class="bx bx-layer" /></div>
            <h4 class="title"><a href="">Graphic Design</a></h4>
            <p class="description">
              At vero eos et accusamus et iusto odio dignissimos ducimus qui
              blanditiis
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!--<section id="testimonials" class="testimonials section-bg">
    <div class="container" data-aos="fade-up">
      <div class="section-title">
        <h2>Testimonials</h2>
        <p>
          Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex
          aliquid fuga eum quidem. Sit sint consectetur velit. Quisquam quos
          quisquam cupiditate. Et nemo qui impedit suscipit alias ea. Quia
          fugiat sit in iste officiis commodi quidem hic quas.
        </p>
      </div>

      <div class="owl-carousel testimonials-carousel">
        <div class="testimonial-item">
          <p>
            <i class="bx bxs-quote-alt-left quote-icon-left" />
            Proin iaculis purus consequat sem cure digni ssim donec porttitora
            entum suscipit rhoncus. Accusantium quam, ultricies eget id, aliquam
            eget nibh et. Maecen aliquam, risus at semper.
            <i class="bx bxs-quote-alt-right quote-icon-right" />
          </p>
          <img
            src="assets/img/testimonials/testimonials-1.jpg"
            class="testimonial-img"
            alt="" />
          <h3>Saul Goodman</h3>
          <h4>Ceo &amp; Founder</h4>
        </div>

        <div class="testimonial-item">
          <p>
            <i class="bx bxs-quote-alt-left quote-icon-left" />
            Export tempor illum tamen malis malis eram quae irure esse labore
            quem cillum quid cillum eram malis quorum velit fore eram velit sunt
            aliqua noster fugiat irure amet legam anim culpa.
            <i class="bx bxs-quote-alt-right quote-icon-right" />
          </p>
          <img
            src="assets/img/testimonials/testimonials-2.jpg"
            class="testimonial-img"
            alt="" />
          <h3>Sara Wilsson</h3>
          <h4>Designer</h4>
        </div>

        <div class="testimonial-item">
          <p>
            <i class="bx bxs-quote-alt-left quote-icon-left" />
            Enim nisi quem export duis labore cillum quae magna enim sint quorum
            nulla quem veniam duis minim tempor labore quem eram duis noster
            aute amet eram fore quis sint minim.
            <i class="bx bxs-quote-alt-right quote-icon-right" />
          </p>
          <img
            src="assets/img/testimonials/testimonials-3.jpg"
            class="testimonial-img"
            alt="" />
          <h3>Jena Karlis</h3>
          <h4>Store Owner</h4>
        </div>

        <div class="testimonial-item">
          <p>
            <i class="bx bxs-quote-alt-left quote-icon-left" />
            Fugiat enim eram quae cillum dolore dolor amet nulla culpa multos
            export minim fugiat minim velit minim dolor enim duis veniam ipsum
            anim magna sunt elit fore quem dolore labore illum veniam.
            <i class="bx bxs-quote-alt-right quote-icon-right" />
          </p>
          <img
            src="assets/img/testimonials/testimonials-4.jpg"
            class="testimonial-img"
            alt="" />
          <h3>Matt Brandon</h3>
          <h4>Freelancer</h4>
        </div>

        <div class="testimonial-item">
          <p>
            <i class="bx bxs-quote-alt-left quote-icon-left" />
            Quis quorum aliqua sint quem legam fore sunt eram irure aliqua
            veniam tempor noster veniam enim culpa labore duis sunt culpa nulla
            illum cillum fugiat legam esse veniam culpa fore nisi cillum quid.
            <i class="bx bxs-quote-alt-right quote-icon-right" />
          </p>
          <img
            src="assets/img/testimonials/testimonials-5.jpg"
            class="testimonial-img"
            alt="" />
          <h3>John Larson</h3>
          <h4>Entrepreneur</h4>
        </div>
      </div>
    </div>
  </section>-->

  <section id="team" class="team">
    <div class="container" data-aos="fade-up">
      <div class="section-title">
        <h2>Team</h2>
        <p>
          Our team is two object oriented entrapuerers who are goal driven to
          deliver the very best products. No matter what comes through our
          pipeline, it is given detail driven results from conception to reality
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
                <a href=""><i class="icofont-twitter" /></a>
                <a href=""><i class="icofont-facebook" /></a>
                <a href=""><i class="icofont-instagram" /></a>
                <a href=""><i class="icofont-linkedin" /></a>
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
                <a href=""><i class="icofont-twitter" /></a>
                <a href=""><i class="icofont-facebook" /></a>
                <a href=""><i class="icofont-instagram" /></a>
                <a href=""><i class="icofont-linkedin" /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!--<section id="faq" class="faq">
    <div class="container" data-aos="fade-up">
      <div class="section-title">
        <h2>Frequently Asked Questions</h2>
      </div>

      <ul class="faq-list">
        <li data-aos="fade-up" data-aos-delay="100">
          <a data-bs-toggle="collapse" class="" data-bs-target="#faq1">Non
            consectetur a erat nam at lectus urna duis?
            <i class="icofont-simple-up" /></a>
          <div id="faq1" class="collapse show" data-bs-parent=".faq-list">
            <p>
              Feugiat pretium nibh ipsum consequat. Tempus iaculis urna id
              volutpat lacus laoreet non curabitur gravida. Venenatis lectus
              magna fringilla urna porttitor rhoncus dolor purus non.
            </p>
          </div>
        </li>

        <li data-aos="fade-up" data-aos-delay="200">
          <a
            data-bs-toggle="collapse"
            data-bs-target="#faq2"
            class="collapsed">Feugiat scelerisque varius morbi enim nunc
            faucibus a pellentesque?
            <i class="icofont-simple-up" /></a>
          <div id="faq2" class="collapse" data-bs-parent=".faq-list">
            <p>
              Dolor sit amet consectetur adipiscing elit pellentesque habitant
              morbi. Id interdum velit laoreet id donec ultrices. Fringilla
              phasellus faucibus scelerisque eleifend donec pretium. Est
              pellentesque elit ullamcorper dignissim. Mauris ultrices eros in
              cursus turpis massa tincidunt dui.
            </p>
          </div>
        </li>

        <li data-aos="fade-up" data-aos-delay="300">
          <a
            data-bs-toggle="collapse"
            data-bs-target="#faq3"
            class="collapsed">Dolor sit amet consectetur adipiscing elit
            pellentesque habitant morbi?
            <i class="icofont-simple-up" /></a>
          <div id="faq3" class="collapse" data-bs-parent=".faq-list">
            <p>
              Eleifend mi in nulla posuere sollicitudin aliquam ultrices
              sagittis orci. Faucibus pulvinar elementum integer enim. Sem nulla
              pharetra diam sit amet nisl suscipit. Rutrum tellus pellentesque
              eu tincidunt. Lectus urna duis convallis convallis tellus. Urna
              molestie at elementum eu facilisis sed odio morbi quis
            </p>
          </div>
        </li>

        <li data-aos="fade-up" data-aos-delay="400">
          <a
            data-bs-toggle="collapse"
            data-bs-target="#faq4"
            class="collapsed">Ac odio tempor orci dapibus. Aliquam eleifend mi
            in nulla?
            <i class="icofont-simple-up" /></a>
          <div id="faq4" class="collapse" data-bs-parent=".faq-list">
            <p>
              Dolor sit amet consectetur adipiscing elit pellentesque habitant
              morbi. Id interdum velit laoreet id donec ultrices. Fringilla
              phasellus faucibus scelerisque eleifend donec pretium. Est
              pellentesque elit ullamcorper dignissim. Mauris ultrices eros in
              cursus turpis massa tincidunt dui.
            </p>
          </div>
        </li>

        <li data-aos="fade-up" data-aos-delay="500">
          <a
            data-bs-toggle="collapse"
            data-bs-target="#faq5"
            class="collapsed">Tempus quam pellentesque nec nam aliquam sem et
            tortor consequat?
            <i class="icofont-simple-up" /></a>
          <div id="faq5" class="collapse" data-bs-parent=".faq-list">
            <p>
              Molestie a iaculis at erat pellentesque adipiscing commodo.
              Dignissim suspendisse in est ante in. Nunc vel risus commodo
              viverra maecenas accumsan. Sit amet nisl suscipit adipiscing
              bibendum est. Purus gravida quis blandit turpis cursus in
            </p>
          </div>
        </li>

        <li data-aos="fade-up" data-aos-delay="600">
          <a
            data-bs-toggle="collapse"
            data-bs-target="#faq6"
            class="collapsed">Tortor vitae purus faucibus ornare. Varius vel
            pharetra vel turpis nunc eget lorem dolor?
            <i class="icofont-simple-up" /></a>
          <div id="faq6" class="collapse" data-bs-parent=".faq-list">
            <p>
              Laoreet sit amet cursus sit amet dictum sit amet justo. Mauris
              vitae ultricies leo integer malesuada nunc vel. Tincidunt eget
              nullam non nisi est sit amet. Turpis nunc eget lorem dolor sed. Ut
              venenatis tellus in metus vulputate eu scelerisque. Pellentesque
              diam volutpat commodo sed egestas egestas fringilla phasellus
              faucibus. Nibh tellus molestie nunc non blandit massa enim nec.
            </p>
          </div>
        </li>
      </ul>
    </div>
  </section>-->

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
