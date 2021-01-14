<script>
  // make dynamic date to be added to footer
  let date = new Date().getFullYear();
</script>

<style>
</style>

<footer id="footer">
  <div class="footer-top">
    <div class="container">
      <div class="row">
        <div class="col-lg-3 col-md-6 footer-contact">
          <img
            class="footer-logo"
            src="/assets/img/blue.png"
            alt="Thompson Logo" />
          <p>
            Madison, WI 53713<br />
            United States
            <br /><br />
            <strong>Email:</strong>
            contact@thompsondevgroup.com<br />
          </p>
        </div>

        <div class="col-lg-2 col-md-6 footer-links">
          <h4>Useful Links</h4>
          <ul>
            <li><i class="bx bx-chevron-right" /> <a href="/">Home</a></li>
            <li>
              <i class="bx bx-chevron-right" />
              <a href="/#about">About us</a>
            </li>
            <li>
              <i class="bx bx-chevron-right" />
              <a href="/#services">Services</a>
            </li>
            <li>
              <i class="bx bx-chevron-right" />
              <a href="/terms">Terms of service</a>
            </li>
            <li>
              <i class="bx bx-chevron-right" />
              <a href="/privacy">Privacy policy</a>
            </li>
          </ul>
        </div>

        <div class="col-lg-3 col-md-6 footer-links">
          <h4>Our Services</h4>
          <ul>
            <li>
              <i class="bx bx-chevron-right" />
              <a href="#">Automation Testing</a>
            </li>
            <li>
              <i class="bx bx-chevron-right" />
              <a href="#">Web Development</a>
            </li>
            <li>
              <i class="bx bx-chevron-right" />
              <a href="#">Product Management</a>
            </li>
            <li><i class="bx bx-chevron-right" /> <a href="#">Marketing</a></li>
            <li>
              <i class="bx bx-chevron-right" />
              <a href="#">Graphic Design</a>
            </li>
          </ul>
        </div>

        <div class="col-lg-4 col-md-6 footer-newsletter">
          <h4>Join Our Newsletter</h4>
          <p>
            Keep up to date with holiday sales, new products, services and so
            much more!
          </p>
          <form action="" method="post">
            <input type="email" name="email" /><input
              type="submit"
              value="Subscribe" />
          </form>
        </div>
      </div>
    </div>
  </div>

  <div class="container d-md-flex py-4">
    <div class="me-md-auto text-center text-md-start">
      <div class="copyright">
        {date}
        &copy;
        <strong><span>Thompson Development Group LLC</span></strong>. All Rights
        Reserved
      </div>
      <div class="credits">
        Designed by
        <a href="https://www.thompsondevgroup.com/">Thompson Development Group</a>
      </div>
    </div>
    <div class="social-links text-center text-md-right pt-3 pt-md-0">
      <a href="#" class="twitter"><i class="bx bxl-twitter" /></a>
      <a href="#" class="facebook"><i class="bx bxl-facebook" /></a>
      <a href="#" class="instagram"><i class="bx bxl-instagram" /></a>
      <a href="#" class="google-plus"><i class="bx bxl-skype" /></a>
      <a href="#" class="linkedin"><i class="bx bxl-linkedin" /></a>
    </div>
  </div>
</footer>
