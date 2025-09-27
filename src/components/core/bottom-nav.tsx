// "use client";

// import { cn } from "@/src/lib/utils";
// import { usePathname } from "next/navigation";
// import Link from "next/link";
// import clsx from "clsx";
// import { usePrivy } from "@privy-io/react-auth";
// import { useUser } from "@/hooks/users/use-user";
// import { useEffect, useState } from "react";
// import ProgressiveImg from "./ProgressiveImg";
// import { useMinimalClaws } from "@/hooks/claw/use-minimal-claws";
// import { modifyName } from "@/utils/getRedirectItemUrl";

// export function BottomNav({
//   className,
//   ...props
// }: React.HTMLAttributes<HTMLElement>) {
//   const pathname = usePathname();
//   const [accessToken, setAccessToken] = useState<string>("");

//   const {
//     login,
//     user: privyUser,
//     getAccessToken,
//     // authenticated,
//     // connectWallet,
//     ready,
//   } = usePrivy();

//   const { claws, clawsIsLoading } = useMinimalClaws();

//   const getUserAccessToken = async () => {
//     const userAccessToken = await getAccessToken();

//     if (userAccessToken) {
//       setAccessToken(userAccessToken);
//     }
//   };

//   const { user, isLoading } = useUser({
//     userId: privyUser?.id,
//     accessToken,
//   });

//   useEffect(() => {
//     if (privyUser && ready) {
//       getUserAccessToken();
//     }
//   }, [privyUser, ready]);

//   const emitProfileViewEvent = () => {
//     const profileViewEvent = new CustomEvent("profile_view-event", {
//       detail: {
//         message: "Profile View Event emitted from BottomNav component",
//       },
//     });
//     window.dispatchEvent(profileViewEvent);
//   };

//   return (
//     <nav className={cn(className)} {...props}>
//       <div className="w-full h-fit bg-background grid grid-cols-5 sm:px-6 px-4 py-4 text-[10px]">
//         {/* <Link
//           href="/drops"
//           className="flex justify-between items-center flex-col group"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="24"
//             height="24"
//             viewBox="0 0 19 20"
//             fill="none"
//             className={clsx(
//               pathname?.includes("drops") ? "fill-[#F5A600]" : "fill-[#9C9C9C]",
//               "group-hover:fill-[#F5A600]"
//             )}
//           >
//             <path d="M16.5 8H2.5C1.397 8 0.5 8.897 0.5 10V18C0.5 19.103 1.397 20 2.5 20H16.5C17.603 20 18.5 19.103 18.5 18V10C18.5 8.897 17.603 8 16.5 8ZM2.5 18V10H16.5L16.502 18H2.5ZM2.5 4H16.5V6H2.5V4ZM4.5 0H14.5V2H4.5V0Z" />
//           </svg>
//           <p
//             className={clsx(
//               pathname?.includes("drops") ? "text-[#F5A600]" : "text-[#9C9C9C]",
//               "font-medium group-hover:text-[#F5A600]"
//             )}
//           >
//             Drops
//           </p>
//         </Link> */}
//         <Link
//           href="/marketplace"
//           className="flex justify-center items-center flex-col group"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="24"
//             height="24"
//             viewBox="0 0 18 21"
//             fill="none"
//             className={clsx(
//               pathname?.includes("marketplace")
//                 ? "fill-[#F5A600]"
//                 : "fill-[#9C9C9C]",
//               "group-hover:fill-[#F5A600]"
//             )}
//           >
//             <path d="M16 5H14C14 2.2 11.8 0 9 0C6.2 0 4 2.2 4 5H2C0.9 5 0 5.9 0 7V19C0 20.1 0.9 21 2 21H16C17.1 21 18 20.1 18 19V7C18 5.9 17.1 5 16 5ZM9 2C10.7 2 12 3.3 12 5H6C6 3.3 7.3 2 9 2ZM16 19H2V7H16V19ZM9 11C7.3 11 6 9.7 6 8H4C4 10.8 6.2 13 9 13C11.8 13 14 10.8 14 8H12C12 9.7 10.7 11 9 11Z" />
//           </svg>
//           <p
//             className={clsx(
//               pathname?.includes("marketplace")
//                 ? "text-[#F5A600]"
//                 : "text-[#9C9C9C]",
//               user && !isLoading ? "mt-[3px]" : "sm:mt-1.5 mt-0.5 ",
//               "font-medium group-hover:text-[#F5A600]"
//             )}
//           >
//             Marketplace
//           </p>
//         </Link>
//         <Link
//           href="/activity"
//           className="flex justify-between items-center flex-col group"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="24"
//             height="24"
//             viewBox="0 0 21 20"
//             fill="none"
//             className={clsx(
//               pathname?.includes("activity")
//                 ? "stroke-[#F5A600]"
//                 : "stroke-[#9C9C9C]",
//               "group-hover:stroke-[#F5A600] "
//             )}
//           >
//             <path
//               d="M19.5 19H3.1C2.53995 19 2.25992 19 2.04601 18.891C1.85785 18.7951 1.70487 18.6422 1.60899 18.454C1.5 18.2401 1.5 17.9601 1.5 17.4V1M18.5 6L14.5811 10.1827C14.4326 10.3412 14.3584 10.4204 14.2688 10.4614C14.1897 10.4976 14.1026 10.5125 14.016 10.5047C13.9179 10.4958 13.8215 10.4458 13.6287 10.3457L10.3713 8.6543C10.1785 8.5542 10.0821 8.5042 9.984 8.4953C9.8974 8.4875 9.8103 8.5024 9.7312 8.5386C9.6416 8.5796 9.5674 8.6588 9.4189 8.8173L5.5 13"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </svg>
//           <p
//             className={clsx(
//               pathname?.includes("activity")
//                 ? "text-[#F5A600]"
//                 : "text-[#9C9C9C]",
//               "font-medium group-hover:text-[#F5A600]"
//             )}
//           >
//             Activity
//           </p>
//         </Link>
//         <Link
//           href={
//             !clawsIsLoading && claws && claws?.length
//               ? claws?.length > 1
//                 ? "/claw"
//                 : `/claw/${modifyName(claws[0]?.name)}-${claws[0]?.id}`
//               : ""
//           }
//           className="flex justify-end items-center flex-col group"
//         >
//           <div
//             className={clsx(
//               pathname?.includes("claw") ? "bg-[#F5A600]" : "bg-white",
//               "sm:size-[60px] size-[54px] absolute border-black border-4 -top-[15px] rounded-full flex items-center justify-center"
//             )}
//           >
//             <svg
//               width="27"
//               height="26"
//               viewBox="0 0 27 26"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//               xmlnsXlink="http://www.w3.org/1999/xlink"
//             >
//               <rect
//                 x="0.5"
//                 width="26"
//                 height="26"
//                 fill="url(#pattern0_13608_6403)"
//               />
//               <defs>
//                 <pattern
//                   id="pattern0_13608_6403"
//                   patternContentUnits="objectBoundingBox"
//                   width="1"
//                   height="1"
//                 >
//                   <use
//                     xlinkHref="#image0_13608_6403"
//                     transform="scale(0.0078125)"
//                   />
//                 </pattern>
//                 <image
//                   id="image0_13608_6403"
//                   width="128"
//                   height="128"
//                   xlinkHref="/img/claw/claw-icon.png"
//                 />
//               </defs>
//             </svg>
//           </div>
//           <p
//             className={clsx(
//               pathname?.includes("claw") ? "text-[#F5A600]" : "text-[#9C9C9C]",
//               "font-medium group-hover:text-[#F5A600] -mb-px"
//             )}
//           >
//             Claw
//           </p>
//         </Link>
//         {ready && privyUser && user && !isLoading ? (
//           <>
//             <Link
//               href={`/user/${user.walletAddress}`}
//               className="flex justify-between items-center flex-col group"
//             >
//               <svg
//                 width="24"
//                 height="25"
//                 viewBox="0 0 19 20"
//                 fill="none"
//                 xmlns="http://www.w3.org/2000/svg"
//                 className={clsx(
//                   pathname?.includes("user")
//                     ? "fill-[#F5A600]"
//                     : "fill-[#9C9C9C]",
//                   "group-hover:fill-[#F5A600]"
//                 )}
//               >
//                 <path d="M16.1992 8H2.19922C1.09622 8 0.199219 8.897 0.199219 10V18C0.199219 19.103 1.09622 20 2.19922 20H16.1992C17.3022 20 18.1992 19.103 18.1992 18V10C18.1992 8.897 17.3022 8 16.1992 8ZM2.19922 18V10H16.1992L16.2012 18H2.19922ZM2.19922 4H16.1992V6H2.19922V4ZM4.19922 0H14.1992V2H4.19922V0Z" />
//               </svg>
//               <p
//                 className={clsx(
//                   pathname?.includes("user")
//                     ? "text-[#F5A600]"
//                     : "text-[#9C9C9C]",
//                   "font-medium group-hover:text-[#F5A600] -mb-px"
//                 )}
//               >
//                 Collection
//               </p>
//             </Link>
//             <div
//               onClick={() => emitProfileViewEvent()}
//               className="flex justify-between items-center flex-col hover:cursor-pointer group"
//             >
//               <div className="size-[28px] mt-[-2px] rounded-full overflow-hidden">
//                 <ProgressiveImg
//                   src={user.profileImage}
//                   className="w-full h-full object-cover object-center"
//                   alt={`${user.username}'s profile image`}
//                 />
//               </div>
//               <p
//                 className={clsx(
//                   pathname?.includes("profile")
//                     ? "text-[#F5A600]"
//                     : "text-[#9C9C9C]",
//                   "font-medium group-hover:text-[#F5A600]"
//                 )}
//               >
//                 Profile
//               </p>
//             </div>
//           </>
//         ) : (
//           <>
//             <Link
//               href="/partner_signup"
//               className="flex justify-between items-center flex-col group"
//             >
//               <svg
//                 width="24"
//                 height="24"
//                 viewBox="0 0 22 22"
//                 fill="none"
//                 xmlns="http://www.w3.org/2000/svg"
//                 className={clsx(
//                   pathname?.includes("partner_signup")
//                     ? "stroke-[#F5A600]"
//                     : "stroke-[#9C9C9C]",
//                   "group-hover:stroke-[#F5A600] "
//                 )}
//               >
//                 <path
//                   d="M7.19922 7H7.20922M1.19922 4.2V8.67451C1.19922 9.1637 1.19922 9.4083 1.25448 9.6385C1.30347 9.8425 1.38428 10.0376 1.49394 10.2166C1.61762 10.4184 1.79057 10.5914 2.13648 10.9373L9.80512 18.6059C10.9931 19.7939 11.5872 20.388 12.2721 20.6105C12.8747 20.8063 13.5237 20.8063 14.1262 20.6105C14.8112 20.388 15.4053 19.7939 16.5933 18.6059L18.8051 16.3941C19.9931 15.2061 20.5872 14.612 20.8097 13.927C21.0055 13.3245 21.0055 12.6755 20.8097 12.0729C20.5872 11.388 19.9931 10.7939 18.8051 9.6059L11.1365 1.93726C10.7906 1.59135 10.6176 1.4184 10.4158 1.29472C10.2368 1.18506 10.0417 1.10425 9.83772 1.05526C9.60752 1 9.36292 1 8.87374 1H4.39922C3.27912 1 2.71906 1 2.29124 1.21799C1.91492 1.40973 1.60895 1.71569 1.41721 2.09202C1.19922 2.51984 1.19922 3.07989 1.19922 4.2ZM7.69922 7C7.69922 7.27614 7.47536 7.5 7.19922 7.5C6.92308 7.5 6.69922 7.27614 6.69922 7C6.69922 6.72386 6.92308 6.5 7.19922 6.5C7.47536 6.5 7.69922 6.72386 7.69922 7Z"
//                   stroke-width="2"
//                   stroke-linecap="round"
//                   stroke-linejoin="round"
//                 />
//               </svg>
//               <p
//                 className={clsx(
//                   pathname?.includes("partner_signup")
//                     ? "text-[#F5A600]"
//                     : "text-[#9C9C9C]",
//                   "font-medium group-hover:text-[#F5A600]"
//                 )}
//               >
//                 Sell
//               </p>
//             </Link>
//             <div
//               onClick={() => login()}
//               className="flex justify-between items-center flex-col hover:cursor-pointer group"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="24"
//                 height="24"
//                 viewBox="0 0 20 19"
//                 fill="none"
//                 className={clsx(
//                   pathname?.includes("profile")
//                     ? "stroke-[#F5A600]"
//                     : "stroke-[#9C9C9C]",
//                   "group-hover:stroke-[#F5A600]"
//                 )}
//               >
//                 <path
//                   d="M1 18C3.33579 15.5226 6.50702 14 10 14C13.493 14 16.6642 15.5226 19 18M14.5 5.5C14.5 7.98528 12.4853 10 10 10C7.51472 10 5.5 7.98528 5.5 5.5C5.5 3.01472 7.51472 1 10 1C12.4853 1 14.5 3.01472 14.5 5.5Z"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//               </svg>
//               <p className="font-medium group-hover:text-[#F5A600] mb-0 text-[#9C9C9C]">
//                 Login
//               </p>
//             </div>
//           </>
//         )}
//       </div>
//     </nav>
//   );
// }
