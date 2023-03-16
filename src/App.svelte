<!-- App.svelte -->
<script>
  import { Router, Route } from "svelte-routing";

  // No Layout Pages
  import Index from "./views/Index.svelte";
  import Privacy from "./views/Privacy.svelte";
  import Terms from "./views/Terms.svelte";
  import ErrorPage from "./views/Error.svelte";

  export let url = "";
</script>

<Router {url}>
  <!-- no layout pages -->
  <Route path="terms" component={Terms} />
  <Route path="privacy" component={Privacy} />
  <Route path="/" component={Index} />
  <Route path="*" component={ErrorPage} />
</Router>
