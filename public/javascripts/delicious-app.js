import "../sass/style.scss"

import {$, $$} from "./modules/bling"
import autoComplete from "./modules/autoComplete"
import typeAhead from "./modules/typeAhead"
import map from "./modules/map"

autoComplete($("#address"), $("#lat"), $("#lng"))
typeAhead($(".search"))
map($("#map"))
