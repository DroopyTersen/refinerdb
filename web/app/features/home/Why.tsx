export default function Why() {
  return (
    <>
      <h2 id="why">Why RefinerDB and not X?</h2>
      There are already some great offerings that can very capably power this UX.
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <ul>
            <li>
              <a href="https://www.elastic.co/">Elasticsearch</a>
            </li>
            <li>
              <a href="https://www.algolia.com/">Algolia</a>
            </li>
            <li>
              <a href="https://www.appbase.io/">Appbase</a>
            </li>
          </ul>

          <p>However, these solutions generally:</p>
          <ul>
            <li>
              Require you to write code to{" "}
              <b>copy items from your database to their system</b>.
            </li>
            <li>
              EITHER are tricky and{" "}
              <b>time consuming to leverage their APIs to build this specific UX</b>.
            </li>
            <li>
              OR provide <b>UI components that are a little to prescriptive</b> and hard
              to customize to specific UI needs.
            </li>
            <li>
              Mean adding another element to the your app's architecture. For simple
              situations, this often feels like overkill.
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-8 p-4 bg-gray-200 rounded">
          <img src="/images/elastic-logo.svg" alt="Elasticsearch" />
          <img src="/images/algolia.svg" alt="Algolia" />
          <img src="/images/appbase.svg" alt="Appbase" />
        </div>
      </div>
    </>
  );
}
