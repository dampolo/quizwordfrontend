import { useEffect } from "react";

function PageTitle({ title }) {
  useEffect(() => {
    document.title = `${title} | Quiz Word`;
  }, [title]);

  return null;
}

export default PageTitle;