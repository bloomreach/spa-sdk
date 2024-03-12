import axios from "axios";
import {headers} from "next/headers";
import {buildConfiguration} from "../utils/buildConfiguration";
import {initialize} from "@bloomreach/spa-sdk";
import BrxApp from "../components/BrxApp";

export default async function Page() {
  const _headers = headers();
  const url = _headers.get('x-url');
  const configuration = buildConfiguration(url ?? '/');
  const page = await initialize({ ...configuration, httpClient: axios });
  const copiedPage = JSON.parse(JSON.stringify(page));

  return (
    <BrxApp configuration={configuration} page={copiedPage} />
  )
}
