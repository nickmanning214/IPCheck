import React from "react";
import { render } from "ink";

import { App } from "./app/App";
import { connectivityLiveLayer } from "./services/connectivity/connectivityLiveLayer";

render(<App connectivityLayer={connectivityLiveLayer} />);
