import "../sass/style.scss"

import {$, $$} from "./modules/bling"
import autoComplete from "./modules/autoComplete"
import typeAhead from "./modules/typeAhead"
import map from "./modules/map"
import heart from "./modules/heart"

autoComplete($("#address"), $("#lat"), $("#lng"))
typeAhead($(".search"))
map($("#map"))

const hearts = $$(".heart")

hearts.on("click", heart)
