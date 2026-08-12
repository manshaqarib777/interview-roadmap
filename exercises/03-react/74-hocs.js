'use strict';
// Lesson 74 — Higher-Order Components. Run with:  node exercises/03-react/74-hocs.js
// Predict every output BEFORE running. Write your prediction in the comment.
//
// A component is just a function from props to output, so an HOC here is a
// function that returns a NEW function (the wrapper component) which renders
// the wrapped one with extra props — same shape as withAuth(Component) in JSX.

// ── Task 1 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (props injected + ...props passthrough)
function withAuth(WrappedComponent) {
  return function Authenticated(props) {
    return WrappedComponent({ ...props, user: 'mansha' });
  };
}

function Profile(props) {
  return `${props.name} logged in as ${props.user}`;
}

function task1() {
  const AuthedProfile = withAuth(Profile);
  console.log(AuthedProfile({ name: 'Ali' }));
}
// task1();

// ── Task 2 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (composition ORDER matters — the outer
// wrapper SEES what the inner wrapper injected: an order-dependent bug)
function withLoadingSpinner(WrappedComponent) {
  return function WithLoading(props) {
    return WrappedComponent({ ...props, loading: true });
  };
}

// NOTE: this wrapper changes behaviour based on `loading` — which only
// exists if a wrapper closer to the component injected it. Order now matters.
function withAuth(WrappedComponent) {
  return function Authenticated(props) {
    if (props.loading) return 'auth skipped while loading';
    return WrappedComponent({ ...props, user: 'mansha' });
  };
}

function task2() {
  const Page = ({ user, loading }) => `user=${user} loading=${loading}`;
  const Both = withAuth(withLoadingSpinner(Page));       // auth is OUTER
  console.log(Both({}));
  const Reversed = withLoadingSpinner(withAuth(Page));   // auth is INNER
  console.log(Reversed({}));
}
// task2();

// ── Task 3 ──────────────────────────────────────────────────────────
// Implement withLoading: inject `loading: true` and pass ALL other props
// through to the wrapped component. The wrapper must not swallow anything.
function withLoading(WrappedComponent) {
  // your code here
}

function task3() {
  const View = (props) => `url=${props.url} loading=${props.loading}`;
  const Loaded = withLoading(View);
  console.log(Loaded({ url: '/api/me' })); // "url=/api/me loading=true"
}
// task3();

// ── Task 4 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (the injected-prop COLLISION bug —
// TWO wrappers inject `data`, with DIFFERENT values: one silently wins)
function withDataFrom(source) {
  return function withData(WrappedComponent) {
    return function WithData(props) {
      return WrappedComponent({ ...props, data: source });
    };
  };
}

function task4() {
  const Show = ({ data }) => `data=${data}`;
  const DoubleWrapped = withDataFrom('from A')(withDataFrom('from B')(Show));
  console.log(DoubleWrapped({})); // which wrapper's `data` wins?
}
// task4();

// ── Task 5 ──────────────────────────────────────────────────────────
// Prediction: ______________________  (statics do NOT survive the wrap)
function withFeature(WrappedComponent) {
  function WithFeature(props) {
    return WrappedComponent({ ...props });
  }
  return WithFeature;
}

function task5() {
  const Page = function Page() { return 'page'; };
  Page.title = 'My Page'; // a static — like Component.title

  const Enhanced = withFeature(Page);
  console.log('title:', Enhanced.title); // did the static survive?
  console.log('renders:', Enhanced({})); // rendering still works?
}
// task5();

// ── Task 6 ──────────────────────────────────────────────────────────
// Implement withFeatureProper: return a new component that
//   - copies the wrapped component's statics (including .title) onto itself,
//   - sets .displayName to `WithFeature(<OriginalName>)`, and
//   - still passes props through and renders the original.
function withFeatureProper(WrappedComponent) {
  // your code here
}

function task6() {
  const Page = function Page() { return 'page'; };
  Page.title = 'My Page';

  const Enhanced = withFeatureProper(Page);
  console.log('title:', Enhanced.title);            // must be 'My Page'
  console.log('displayName:', Enhanced.displayName); // must be 'WithFeature(Page)'
  console.log('renders:', Enhanced({}));            // must be 'page'
}
// task6();

module.exports = { withLoading, withFeatureProper };
