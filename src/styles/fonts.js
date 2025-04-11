import { Quicksand} from "next/font/google";

const quicksand = Quicksand({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});


export const fonts = {
  quicksand: quicksand.style.fontFamily,
};
