import React from 'react'

export const CharWrapper = ({ children }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 19 23">
            {children}
        </svg>
    )
}
export const Char1 = () => (
    <>
        <path
            className="inner"
            d="M4.56 20v-2.904h4.513V5.864h-.216l-3.408 4.464-2.304-1.8 4.008-5.28h5.52v13.848h3.552V20H4.56z"
        ></path>
        <path
            className="outer"
            fillRule="evenodd"
            d="M2.56 22v-6.904h4.513v-3.6L5.81 13.15.36 8.89l5.8-7.641h8.514v13.848h3.552V22H2.56zM8.858 5.864h.216v11.232H4.56V20h11.664v-2.904h-3.552V3.248h-5.52l-4.008 5.28 2.304 1.8 3.408-4.464z"
            clipRule="evenodd"
        ></path>
    </>
)

export const Char2 = () => (
    <>
        <path
            className="inner"
            d="M15.625 20H3.577v-3.288l5.28-4.392c.912-.784 1.568-1.464 1.968-2.04.4-.576.6-1.184.6-1.824v-.24c0-.704-.208-1.232-.624-1.584-.416-.368-.976-.552-1.68-.552-.8 0-1.416.232-1.848.696a3.911 3.911 0 00-.912 1.656l-3.144-1.2c.192-.576.456-1.12.792-1.632.336-.528.76-.984 1.272-1.368a6.494 6.494 0 011.824-.912c.688-.24 1.48-.36 2.376-.36.912 0 1.728.128 2.448.384s1.328.608 1.824 1.056c.496.448.872.984 1.128 1.608.256.608.384 1.272.384 1.992 0 .704-.12 1.352-.36 1.944a6.073 6.073 0 01-.96 1.632c-.4.512-.88 1.008-1.44 1.488-.544.48-1.128.96-1.752 1.44L7.56 16.976h8.064V20z"
        ></path>
        <path
            className="outer"
            fillRule="evenodd"
            d="M17.625 22H1.577v-6.226l5.79-4.817-6.654-2.54L1.32 6.6a8.993 8.993 0 011.01-2.086 7.168 7.168 0 011.752-1.882l.011-.009.012-.008a8.483 8.483 0 012.362-1.19C7.403 1.1 8.418.96 9.481.96c1.097 0 2.146.154 3.118.5.932.331 1.777.808 2.494 1.456a6.378 6.378 0 011.635 2.324c.366.873.537 1.801.537 2.76 0 .93-.159 1.832-.501 2.682a8.071 8.071 0 01-1.255 2.14 12.427 12.427 0 01-1.692 1.751c-.152.135-.308.269-.466.403h4.274V22zm-6.872-7.496c.624-.48 1.208-.96 1.752-1.44.56-.48 1.04-.976 1.44-1.488a6.073 6.073 0 00.96-1.632c.24-.592.36-1.24.36-1.944 0-.72-.128-1.384-.384-1.992A4.378 4.378 0 0013.753 4.4c-.496-.448-1.104-.8-1.824-1.056S10.393 2.96 9.48 2.96c-.896 0-1.688.12-2.376.36a6.494 6.494 0 00-1.824.912A5.18 5.18 0 004.009 5.6a7.028 7.028 0 00-.792 1.632l3.144 1.2c.074-.27.171-.525.291-.764.164-.327.371-.624.62-.892.433-.464 1.049-.696 1.849-.696.704 0 1.264.184 1.68.552.416.352.624.88.624 1.584v.24c0 .64-.2 1.248-.6 1.824-.4.576-1.056 1.256-1.968 2.04l-5.28 4.392V20h12.048v-3.024H7.56l3.192-2.472zm-2.897-3.966c.68-.608 1.1-1.072 1.326-1.399.19-.274.243-.49.243-.683v-.24c0-.043-.002-.077-.004-.105a1.18 1.18 0 00-.3-.031 1.052 1.052 0 00-.378.054.062.062 0 00-.005.003l-.001.002c-.202.217-.353.48-.448.823l-.433 1.576z"
            clipRule="evenodd"
        ></path>
    </>
)

export const Char3 = () => (
    <>
        <path
            className="inner"
            d="M8.857 9.872c.928 0 1.6-.176 2.016-.528.432-.352.648-.784.648-1.296V7.88c0-.608-.208-1.088-.624-1.44-.4-.368-.976-.552-1.728-.552-.688 0-1.336.176-1.944.528-.592.336-1.096.824-1.512 1.464l-2.28-2.112c.32-.416.672-.792 1.056-1.128a5.854 5.854 0 011.272-.888 5.828 5.828 0 011.56-.576 8.444 8.444 0 011.992-.216c.912 0 1.736.104 2.472.312.736.208 1.36.512 1.872.912.528.384.936.848 1.224 1.392.288.544.432 1.152.432 1.824 0 .528-.088 1.008-.264 1.44a3.58 3.58 0 01-.72 1.128c-.288.32-.632.584-1.032.792-.384.192-.8.328-1.248.408v.144c1.024.176 1.872.608 2.544 1.296.688.672 1.032 1.584 1.032 2.736 0 .752-.16 1.432-.48 2.04a4.391 4.391 0 01-1.32 1.56c-.56.432-1.248.768-2.064 1.008-.8.224-1.696.336-2.688.336-.848 0-1.6-.088-2.256-.264a7.162 7.162 0 01-1.704-.696 6.452 6.452 0 01-1.296-1.032c-.352-.4-.664-.808-.936-1.224l2.664-2.064a5.587 5.587 0 001.368 1.704c.56.432 1.304.648 2.232.648.864 0 1.528-.2 1.992-.6.464-.4.696-.952.696-1.656v-.168c0-.688-.264-1.2-.792-1.536-.528-.352-1.264-.528-2.208-.528h-1.56v-3h1.584z"
        ></path>
        <path
            className="outer"
            fillRule="evenodd"
            d="M6.835 6.668c.125-.092.255-.176.39-.252a3.818 3.818 0 011.944-.528c.752 0 1.328.184 1.728.552.416.352.624.832.624 1.44v.168c0 .512-.216.944-.648 1.296l-.004.003c-.209.176-.482.308-.82.395-.335.087-.732.13-1.192.13H7.273v3h1.56a5.517 5.517 0 011.276.136c.361.088.672.219.932.392.528.336.792.848.792 1.536v.168c0 .704-.232 1.256-.696 1.656-.464.4-1.128.6-1.992.6-.928 0-1.672-.216-2.232-.648a5.66 5.66 0 01-1.368-1.704L2.88 17.072c.272.416.584.824.936 1.224a5.292 5.292 0 00.334.322c.288.257.609.494.962.71.496.288 1.064.52 1.704.696.656.176 1.408.264 2.256.264.992 0 1.888-.112 2.688-.336.816-.24 1.504-.576 2.064-1.008a4.391 4.391 0 001.32-1.56c.32-.608.48-1.288.48-2.04 0-1.152-.344-2.064-1.032-2.736a4.545 4.545 0 00-.645-.545 4.685 4.685 0 00-1.873-.746l-.026-.005v-.144l.025-.005c.438-.08.846-.215 1.223-.403a3.62 3.62 0 001.03-.79l.002-.002a3.58 3.58 0 00.72-1.128c.176-.432.264-.912.264-1.44 0-.672-.144-1.28-.432-1.824a4.059 4.059 0 00-1.224-1.392c-.512-.4-1.136-.704-1.872-.912-.736-.208-1.56-.312-2.472-.312-.736 0-1.4.072-1.992.216a5.828 5.828 0 00-1.56.576 5.862 5.862 0 00-1.334.942c-.36.322-.691.68-.994 1.074l2.28 2.112.005-.008c.32-.491.693-.892 1.117-1.204zm-1.562 3.53L.735 5.996 1.847 4.55a9.87 9.87 0 011.308-1.4 7.853 7.853 0 011.663-1.161 7.827 7.827 0 012.05-.76C7.636 1.043 8.455.96 9.312.96c1.061 0 2.072.12 3.016.387.93.263 1.789.666 2.532 1.24a6.053 6.053 0 011.787 2.053c.455.858.665 1.792.665 2.76a5.78 5.78 0 01-.412 2.195 5.614 5.614 0 01-.942 1.55l.048.05c1.136 1.118 1.618 2.58 1.618 4.149 0 1.038-.222 2.036-.7 2.953a6.39 6.39 0 01-1.89 2.239c-.789.606-1.707 1.04-2.71 1.335l-.012.003-.013.004c-1.006.282-2.087.41-3.227.41-.982 0-1.914-.101-2.775-.332l-.012-.004a9.153 9.153 0 01-2.178-.894l-.02-.012-.02-.013a8.449 8.449 0 01-1.695-1.353l-.03-.03-.028-.033c-.41-.466-.78-.95-1.108-1.45L.197 16.62l5.076-3.932v-2.49zm2.599 4.674c.091.1.185.19.282.271.125.089.4.217.99.217.45 0 .63-.081.676-.108a.7.7 0 00.013-.148v-.09c-.148-.061-.45-.142-1-.142h-.961zm1.961.371z"
            clipRule="evenodd"
        ></path>
    </>
)

export const Char4 = () => (
    <>
        <path
            className="inner"
            d="M10.44 20v-3.216H2.906v-3.072L9.577 3.248h4.32V14h2.16v2.784h-2.16V20H10.44zM5.81 14h4.632V6.968h-.216L5.809 14z"
        ></path>
        <path
            className="outer"
            fillRule="evenodd"
            d="M8.44 22v-3.216H.906v-5.655L8.48 1.248h7.417V12h2.16v6.784h-2.16V22H8.44zm2-5.216V20h3.457v-3.216h2.16V14h-2.16V3.248h-4.32L2.905 13.712v3.072h7.536zM5.81 14h4.632V6.968h-.216L5.809 14z"
            clipRule="evenodd"
        ></path>
    </>
)

export const Char5 = () => (
    <>
        <path
            className="inner"
            d="M14.905 6.392H7.153l-.384 5.304h.216c.176-.384.376-.736.6-1.056.224-.336.488-.616.792-.84.304-.24.656-.424 1.056-.552.4-.128.856-.192 1.368-.192.688 0 1.336.12 1.944.36.624.24 1.168.592 1.632 1.056a4.64 4.64 0 011.128 1.68c.272.656.408 1.4.408 2.232 0 .848-.144 1.632-.432 2.352a5.192 5.192 0 01-1.272 1.872c-.544.528-1.224.944-2.04 1.248-.816.288-1.744.432-2.784.432-.816 0-1.544-.088-2.184-.264a7.162 7.162 0 01-1.704-.696 6.763 6.763 0 01-1.272-1.032 8.986 8.986 0 01-.912-1.224l2.616-2.064c.192.32.392.624.6.912.224.288.472.544.744.768.288.208.6.376.936.504.352.112.752.168 1.2.168.896 0 1.568-.24 2.016-.72.464-.496.696-1.152.696-1.968v-.192c0-.784-.232-1.4-.696-1.848-.464-.448-1.104-.672-1.92-.672-.672 0-1.232.136-1.68.408-.432.256-.76.512-.984.768l-2.952-.408.624-9.48h10.392v3.144z"
        ></path>
        <path
            className="outer"
            fillRule="evenodd"
            d="M15.014 8.392h1.89V1.248H2.64l-.87 13.206 1.388.192-2.481 1.958.932 1.516c.32.521.694 1.02 1.114 1.497l.028.032.03.03a8.763 8.763 0 001.646 1.339l.032.02.033.02c.666.386 1.398.68 2.178.894.847.233 1.759.336 2.715.336 1.222 0 2.381-.17 3.45-.546l.016-.006.016-.006c1.032-.384 1.956-.934 2.724-1.677a7.19 7.19 0 001.747-2.574 8.273 8.273 0 00.575-3.095c0-1.048-.172-2.056-.558-2.99-.365-.9-.889-1.7-1.588-2.36a6.628 6.628 0 00-.753-.642zm-.637 2.08a4.632 4.632 0 00-1.632-1.056 5.246 5.246 0 00-1.944-.36c-.512 0-.968.064-1.368.192-.175.056-.34.122-.496.2-.202.1-.389.217-.56.352a3.156 3.156 0 00-.402.353 3.492 3.492 0 00-.39.487 6.44 6.44 0 00-.399.65l-.007.014a7.162 7.162 0 00-.194.392h-.216l.384-5.304h7.752V3.248H4.513l-.624 9.48 2.952.408a2.499 2.499 0 01.184-.189c.207-.193.474-.386.8-.579.093-.057.191-.107.294-.152.288-.126.614-.205.978-.238.131-.012.267-.018.408-.018.816 0 1.456.224 1.92.672.464.448.696 1.064.696 1.848v.192c0 .816-.232 1.472-.696 1.968-.448.48-1.12.72-2.016.72-.448 0-.848-.056-1.2-.168a4.06 4.06 0 01-.936-.504 4.813 4.813 0 01-.744-.768 12.81 12.81 0 01-.587-.89l-.013-.022-2.616 2.064c.256.416.56.824.912 1.224a6.282 6.282 0 00.344.333c.281.252.59.486.928.699.496.288 1.064.52 1.704.696.64.176 1.368.264 2.184.264 1.04 0 1.968-.144 2.784-.432.816-.304 1.496-.72 2.04-1.248a5.192 5.192 0 001.272-1.872c.288-.72.432-1.504.432-2.352 0-.832-.136-1.576-.408-2.232a4.64 4.64 0 00-1.128-1.68zm-6.25 4.246c.117.146.239.273.367.384.115.078.237.143.37.198.12.033.296.06.545.06.275 0 .43-.037.503-.063a.268.268 0 00.053-.024c.05-.054.156-.187.156-.601v-.192c0-.196-.03-.3-.046-.345a.15.15 0 00-.04-.064.249.249 0 00-.099-.055 1.332 1.332 0 00-.431-.056c-.408 0-.584.082-.642.118l-.01.005-.009.006c-.328.194-.463.324-.498.364l-.224.256.006.009z"
            clipRule="evenodd"
        ></path>
    </>
)

export const Char6 = () => (
    <>
        <path
            className="inner"
            d="M9.6 20.288c-1.007 0-1.911-.152-2.711-.456a5.62 5.62 0 01-1.992-1.344 6.06 6.06 0 01-1.248-2.112c-.288-.816-.432-1.728-.432-2.736 0-1.168.184-2.272.552-3.312.368-1.056.84-2.024 1.416-2.904a14.585 14.585 0 011.968-2.4 16.14 16.14 0 012.184-1.776h4.968a47.616 47.616 0 00-2.808 2.088 20.282 20.282 0 00-2.16 1.992 11.013 11.013 0 00-1.512 2.04 8.457 8.457 0 00-.84 2.28l.216.072c.144-.32.32-.632.528-.936.208-.304.464-.568.768-.792.304-.24.656-.432 1.056-.576.416-.144.896-.216 1.44-.216.704 0 1.36.128 1.968.384.608.24 1.128.592 1.56 1.056.448.448.8.992 1.056 1.632.256.64.384 1.36.384 2.16 0 .848-.152 1.632-.456 2.352a5.464 5.464 0 01-1.296 1.872c-.544.512-1.208.912-1.992 1.2-.784.288-1.656.432-2.616.432zm-.023-2.808c.864 0 1.52-.224 1.968-.672.448-.464.672-1.112.672-1.944v-.336c0-.832-.232-1.464-.696-1.896-.448-.448-1.096-.672-1.944-.672-.816 0-1.456.224-1.92.672-.464.432-.696 1.064-.696 1.896v.336c0 .832.216 1.48.648 1.944.448.448 1.104.672 1.968.672z"
        ></path>
        <path
            className="outer"
            fillRule="evenodd"
            d="M6.155 21.693l-.022-.01a7.617 7.617 0 01-2.69-1.822l-.01-.01-.009-.01a8.06 8.06 0 01-1.661-2.8c-.375-1.061-.546-2.203-.546-3.401 0-1.38.218-2.71.665-3.975.418-1.198.96-2.313 1.63-3.336l.004-.008a16.584 16.584 0 012.238-2.727l.008-.008.008-.007a18.13 18.13 0 012.457-1.995l.504-.336h11.976l-5.264 3.644a45.608 45.608 0 00-2.69 2l-.003.003c-.171.137-.337.275-.498.412.501.087.99.227 1.464.425a6.214 6.214 0 012.244 1.519c.643.65 1.13 1.42 1.474 2.278.364.911.527 1.889.527 2.903a7.983 7.983 0 01-.614 3.13 7.463 7.463 0 01-1.766 2.55h-.002c-.762.718-1.665 1.251-2.673 1.621-1.035.38-2.145.555-3.305.555-1.209 0-2.36-.182-3.423-.586l-.023-.01zm8.366-11.053a4.216 4.216 0 00-1.56-1.056 5.02 5.02 0 00-1.968-.384c-.234 0-.457.013-.667.04a3.834 3.834 0 00-.773.176 3.838 3.838 0 00-1.177.669 3.257 3.257 0 00-.647.699c-.203.297-.376.6-.518.913l-.01.023-.216-.072.005-.023a8.762 8.762 0 01.599-1.79 8.335 8.335 0 01.236-.467 9.774 9.774 0 01.093-.161 10.771 10.771 0 011.338-1.79l.08-.089a20.282 20.282 0 012.27-2.08 48.133 48.133 0 012.699-2H9.337a16.14 16.14 0 00-2.184 1.776 14.585 14.585 0 00-1.968 2.4 13.222 13.222 0 00-1.416 2.904 9.856 9.856 0 00-.552 3.312c0 1.008.144 1.92.432 2.736a6.06 6.06 0 001.248 2.112 5.62 5.62 0 001.992 1.344c.8.304 1.704.456 2.712.456.96 0 1.832-.144 2.616-.432.784-.288 1.448-.688 1.992-1.2a5.464 5.464 0 001.296-1.872c.304-.72.456-1.504.456-2.352 0-.8-.128-1.52-.384-2.16a4.791 4.791 0 00-1.056-1.632zm-7.485 3.133c-.05.23-.075.482-.075.755v.336c0 .832.216 1.48.648 1.944.448.448 1.104.672 1.968.672.864 0 1.52-.224 1.968-.672.448-.464.672-1.112.672-1.944v-.336c0-.832-.232-1.464-.696-1.896-.448-.448-1.096-.672-1.944-.672a4.13 4.13 0 00-.624.05 2.619 2.619 0 00-.668.199 2.203 2.203 0 00-.628.423c-.312.29-.519.67-.621 1.141zm3.087 1.625a.36.36 0 01-.053.021c-.076.026-.23.061-.493.061-.264 0-.418-.035-.494-.06a.44.44 0 01-.037-.015.462.462 0 01-.026-.063 1.542 1.542 0 01-.06-.478v-.336c0-.234.034-.359.052-.409a.23.23 0 01.012-.027l.009-.009.013-.012a.249.249 0 01.1-.055c.069-.025.203-.056.43-.056.253 0 .398.034.47.058.033.012.05.022.056.025l.004.003.026.026.021.02a.24.24 0 01.012.027c.019.05.052.175.052.409v.336c0 .24-.033.382-.059.457a.338.338 0 01-.035.077z"
            clipRule="evenodd"
        ></path>
    </>
)

export const Char7 = () => (
    <>
        <path
            className="inner"
            d="M6.24 20L12 6.176H6.578v3.048H3.529V3.248h12.048v3.12L10.033 20H6.24z"
        ></path>
        <path
            className="outer"
            fillRule="evenodd"
            d="M3.24 22l4.49-10.776H1.53V1.248h16.048v5.511L11.378 22H3.241zM8.578 9.194L9 8.176h-.424v1.018zM12 6.176L6.24 20h3.792l5.544-13.632v-3.12H3.529v5.976h3.048V6.176H12z"
            clipRule="evenodd"
        ></path>
    </>
)

export const Char8 = () => (
    <>
        <path
            className="inner"
            d="M9.505 20.288c-1.008 0-1.904-.12-2.688-.36-.784-.256-1.448-.6-1.992-1.032a4.413 4.413 0 01-1.248-1.536 4.764 4.764 0 01-.408-1.968c0-1.088.312-1.96.936-2.616.624-.672 1.424-1.144 2.4-1.416v-.192c-.832-.304-1.512-.768-2.04-1.392-.528-.624-.792-1.424-.792-2.4 0-.64.128-1.232.384-1.776a3.78 3.78 0 011.128-1.392c.496-.4 1.104-.704 1.824-.912.72-.224 1.552-.336 2.496-.336.928 0 1.752.112 2.472.336.736.208 1.352.512 1.848.912A3.78 3.78 0 0114.953 5.6c.256.544.384 1.136.384 1.776 0 .976-.264 1.776-.792 2.4-.528.624-1.208 1.088-2.04 1.392v.192c.976.272 1.776.744 2.4 1.416.624.656.936 1.528.936 2.616 0 .704-.144 1.36-.432 1.968a4.173 4.173 0 01-1.224 1.536c-.544.432-1.208.776-1.992 1.032-.784.24-1.68.36-2.688.36zm0-2.76c.832 0 1.464-.192 1.896-.576.448-.384.672-.904.672-1.56v-.48c0-.672-.216-1.192-.648-1.56-.432-.384-1.072-.576-1.92-.576-.848 0-1.488.192-1.92.576-.432.368-.648.888-.648 1.56v.48c0 .656.216 1.176.648 1.56.448.384 1.088.576 1.92.576zm0-7.392c.8 0 1.408-.184 1.824-.552.416-.368.624-.864.624-1.488v-.36c0-.624-.216-1.112-.648-1.464-.416-.368-1.016-.552-1.8-.552s-1.392.184-1.824.552c-.416.352-.624.84-.624 1.464v.36c0 .624.208 1.12.624 1.488.416.368 1.024.552 1.824.552z"
        ></path>
        <path
            className="outer"
            fillRule="evenodd"
            d="M6.214 21.835l-.018-.006c-.969-.316-1.854-.762-2.615-1.367a6.412 6.412 0 01-1.803-2.227l-.014-.029-.013-.03a6.763 6.763 0 01-.582-2.784c0-1.487.437-2.886 1.478-3.985.101-.109.205-.214.312-.314l-.021-.025c-.89-1.052-1.265-2.339-1.265-3.692 0-.915.185-1.8.574-2.628m0 0a5.776 5.776 0 011.698-2.11c.727-.582 1.572-.99 2.49-1.258.947-.292 1.98-.42 3.07-.42 1.075 0 2.097.128 3.04.418.93.266 1.786.673 2.52 1.26a5.775 5.775 0 011.697 2.11c.39.828.575 1.713.575 2.628 0 1.353-.375 2.64-1.265 3.692l-.022.025c.107.1.211.205.312.313 1.041 1.1 1.479 2.499 1.479 3.986a6.54 6.54 0 01-.62 2.814 6.173 6.173 0 01-1.793 2.256c-.76.605-1.646 1.05-2.615 1.367l-.017.006-.018.005c-1.011.31-2.11.448-3.273.448-1.163 0-2.262-.138-3.274-.448l-.017-.005m9.195-4.475a4.539 4.539 0 00.432-1.968c0-1.088-.312-1.96-.936-2.616a4.725 4.725 0 00-.386-.371c-.54-.462-1.184-.803-1.936-1.023a6.438 6.438 0 00-.078-.022v-.192a5.259 5.259 0 00.087-.033 4.763 4.763 0 001.953-1.359c.528-.624.792-1.424.792-2.4 0-.64-.128-1.232-.384-1.776a3.78 3.78 0 00-1.128-1.392c-.496-.4-1.112-.704-1.848-.912-.72-.224-1.544-.336-2.472-.336-.944 0-1.776.112-2.496.336-.72.208-1.328.512-1.824.912A3.78 3.78 0 004.057 5.6a4.118 4.118 0 00-.384 1.776c0 .976.264 1.776.792 2.4a4.763 4.763 0 002.04 1.392v.192a6.242 6.242 0 00-.079.022c-.751.22-1.396.561-1.935 1.023-.136.116-.264.24-.386.371-.624.656-.936 1.528-.936 2.616 0 .704.136 1.36.408 1.968a4.413 4.413 0 001.248 1.536c.544.432 1.208.776 1.992 1.032.784.24 1.68.36 2.688.36 1.008 0 1.904-.12 2.688-.36.784-.256 1.448-.6 1.992-1.032a4.173 4.173 0 001.224-1.536zm-4.904-7.346c.328-.091.603-.235.824-.43.064-.057.124-.118.179-.181.296-.344.445-.78.445-1.307v-.36c0-.624-.216-1.112-.648-1.464-.416-.368-1.016-.552-1.8-.552s-1.392.184-1.824.552c-.416.352-.624.84-.624 1.464v.36c0 .527.148.963.445 1.307.054.063.114.124.179.181.22.195.495.339.824.43.29.081.624.122 1 .122.375 0 .709-.04 1-.122zm.92 3.338c-.432-.384-1.072-.576-1.92-.576-.848 0-1.488.192-1.92.576-.432.368-.648.888-.648 1.56v.48c0 .656.216 1.176.648 1.56.448.384 1.088.576 1.92.576.832 0 1.464-.192 1.896-.576.448-.384.672-.904.672-1.56v-.48c0-.672-.216-1.192-.648-1.56zm-2.486 2.104a.785.785 0 01-.002-.064v-.48c0-.027 0-.05.002-.068.074-.026.243-.068.566-.068.322 0 .491.042.565.068a.972.972 0 01.003.068v.48a.667.667 0 01-.003.06c-.053.024-.214.076-.565.076-.316 0-.486-.042-.566-.072zM9.953 7.77a1.572 1.572 0 00-.448-.049c-.228 0-.368.025-.448.047v.325c.077.02.218.044.448.044s.37-.024.448-.044v-.323z"
            clipRule="evenodd"
        ></path>
    </>
)

export const Char9 = () => (
    <>
        <path
            className="inner"
            d="M15.793 9.608a9.928 9.928 0 01-.552 3.336 13.282 13.282 0 01-1.44 2.904 13.517 13.517 0 01-1.968 2.376c-.72.704-1.44 1.296-2.16 1.776H4.705a48.735 48.735 0 002.784-2.064 20.527 20.527 0 002.16-1.992 10.296 10.296 0 001.512-2.064 8 8 0 00.864-2.28l-.216-.072c-.144.32-.328.632-.552.936a3.7 3.7 0 01-.768.816c-.288.224-.64.408-1.056.552-.4.144-.872.216-1.416.216-.704 0-1.36-.12-1.968-.36a4.907 4.907 0 01-1.584-1.056 5.278 5.278 0 01-1.032-1.656c-.256-.64-.384-1.36-.384-2.16 0-.848.152-1.632.456-2.352a5.374 5.374 0 011.272-1.848 5.827 5.827 0 012.016-1.224c.784-.288 1.656-.432 2.616-.432 1.008 0 1.904.16 2.688.48.8.304 1.472.752 2.016 1.344.544.576.96 1.272 1.248 2.088.288.816.432 1.728.432 2.736zm-6.36 1.68c.816 0 1.456-.216 1.92-.648.464-.448.696-1.088.696-1.92v-.336c0-.832-.224-1.472-.672-1.92-.432-.464-1.08-.696-1.944-.696-.864 0-1.52.232-1.968.696-.448.448-.672 1.088-.672 1.92v.336c0 .832.224 1.472.672 1.92.464.432 1.12.648 1.968.648z"
        ></path>
        <path
            className="outer"
            fillRule="evenodd"
            d="M7.409 18l.08-.064a20.527 20.527 0 002.267-2.11c.09-.1.178-.2.263-.3l.017-.019a9.998 9.998 0 001.039-1.473l.004-.007.082-.147a7.932 7.932 0 00.864-2.28l-.216-.072-.01.023a5.136 5.136 0 01-.542.913 3.658 3.658 0 01-.938.938l-.015.01a3.87 3.87 0 01-.871.42c-.228.082-.48.14-.755.176-.207.027-.427.04-.661.04-.704 0-1.36-.12-1.968-.36a4.907 4.907 0 01-1.584-1.056 5.278 5.278 0 01-1.032-1.656c-.256-.64-.384-1.36-.384-2.16 0-.848.152-1.632.456-2.352a5.374 5.374 0 011.272-1.848 5.827 5.827 0 012.016-1.224c.784-.288 1.656-.432 2.616-.432 1.008 0 1.904.16 2.688.48.8.304 1.472.752 2.016 1.344.544.576.96 1.272 1.248 2.088.288.816.432 1.728.432 2.736a9.928 9.928 0 01-.552 3.336 13.282 13.282 0 01-1.44 2.904 13.517 13.517 0 01-1.968 2.376c-.72.704-1.44 1.296-2.16 1.776H4.705a49.185 49.185 0 002.704-2zm5.814 1.662a17.056 17.056 0 01-2.44 2.002l-.505.336H-1.698l5.264-3.644a46.784 46.784 0 002.668-1.977c.18-.146.353-.29.52-.433a7.063 7.063 0 01-1.44-.398l-.02-.008-.021-.009a6.907 6.907 0 01-2.222-1.485l-.026-.025-.024-.026a7.275 7.275 0 01-1.425-2.276c-.365-.911-.527-1.889-.527-2.903 0-1.092.197-2.143.613-3.13A7.373 7.373 0 013.405 3.16a7.825 7.825 0 012.698-1.645C7.138 1.135 8.248.96 9.41.96c1.21 0 2.362.19 3.42.62a7.193 7.193 0 012.747 1.84 7.814 7.814 0 011.67 2.786c.376 1.062.547 2.204.547 3.402 0 1.395-.218 2.734-.667 4.003a15.286 15.286 0 01-1.654 3.336 15.518 15.518 0 01-2.249 2.715zm-3.167-8.421l.162-.03c.184-.04.357-.096.517-.166.232-.103.438-.238.618-.405.312-.301.52-.69.621-1.165.05-.231.075-.483.075-.755v-.336c0-.832-.224-1.472-.672-1.92-.432-.464-1.08-.696-1.944-.696-.864 0-1.52.232-1.968.696-.448.448-.672 1.088-.672 1.92v.336c0 .832.224 1.472.672 1.92.464.432 1.12.648 1.968.648.071 0 .141-.002.21-.005h.01a3.67 3.67 0 00.403-.042zm-.084-2.05a.243.243 0 00.022-.049c.022-.059.055-.189.055-.422v-.336c0-.24-.033-.378-.056-.443a.278.278 0 00-.03-.063l-.026-.025-.014-.016a.293.293 0 00-.03-.012 1.419 1.419 0 00-.46-.057c-.258 0-.404.035-.473.06a.272.272 0 00-.056.025l-.013.013-.012.012a.279.279 0 00-.03.062 1.38 1.38 0 00-.056.444v.336c0 .24.032.378.055.443.006.016.01.027.015.036a.483.483 0 00.067.027c.086.029.245.062.503.062.234 0 .376-.031.452-.057a.345.345 0 00.087-.04zM9.93 7.84l-.002-.001z"
            clipRule="evenodd"
        ></path>
    </>
)

export const Char0 = () => (
    <>
        <path
            className="inner"
            d="M9.505 20.288c-2.24 0-3.896-.76-4.968-2.28-1.056-1.52-1.584-3.648-1.584-6.384S3.48 6.76 4.537 5.24c1.072-1.52 2.728-2.28 4.968-2.28 2.24 0 3.888.76 4.944 2.28 1.072 1.52 1.608 3.648 1.608 6.384s-.536 4.864-1.608 6.384c-1.056 1.52-2.704 2.28-4.944 2.28zm0-2.832c1.072 0 1.816-.376 2.232-1.128.432-.752.648-1.8.648-3.144v-3.12c0-1.344-.216-2.392-.648-3.144-.416-.752-1.16-1.128-2.232-1.128-1.072 0-1.824.376-2.256 1.128-.416.752-.624 1.8-.624 3.144v3.12c0 1.344.208 2.392.624 3.144.432.752 1.184 1.128 2.256 1.128zm0-4.416c-.56 0-.952-.112-1.176-.336a1.156 1.156 0 01-.312-.816v-.528c0-.32.104-.592.312-.816.224-.224.616-.336 1.176-.336.56 0 .944.112 1.152.336.224.224.336.496.336.816v.528c0 .32-.112.592-.336.816-.208.224-.592.336-1.152.336z"
        ></path>
        <path
            className="outer"
            fillRule="evenodd"
            d="M2.894 19.15C1.518 17.168.953 14.582.953 11.623c0-2.959.565-5.545 1.941-7.525l.008-.012C4.428 1.924 6.765.96 9.505.96c2.736 0 5.07.962 6.582 3.133 1.395 1.981 1.97 4.57 1.97 7.531 0 2.961-.575 5.55-1.97 7.53-1.51 2.172-3.846 3.134-6.582 3.134-2.74 0-5.077-.964-6.603-3.127l-.008-.012zM14.45 5.24c-1.056-1.52-2.704-2.28-4.944-2.28-2.24 0-3.896.76-4.968 2.28-1.056 1.52-1.584 3.648-1.584 6.384s.528 4.864 1.584 6.384c1.072 1.52 2.728 2.28 4.968 2.28 2.24 0 3.888-.76 4.944-2.28 1.072-1.52 1.608-3.648 1.608-6.384S15.52 6.76 14.449 5.24zm-2.712 1.68c-.416-.752-1.16-1.128-2.232-1.128-1.072 0-1.824.376-2.256 1.128-.35.633-.554 1.477-.609 2.53-.01.198-.015.402-.015.614v3.12c0 .212.005.416.015.614.055 1.053.258 1.896.609 2.53.432.752 1.184 1.128 2.256 1.128 1.072 0 1.816-.376 2.232-1.128.366-.638.577-1.49.633-2.554.01-.19.015-.386.015-.59v-3.12c0-.204-.005-.4-.015-.59-.056-1.065-.267-1.916-.633-2.554zm-1.588 1.326a1.935 1.935 0 00-.146-.33l-.009-.014-.007-.014a.21.21 0 00-.017-.026.124.124 0 00-.005-.003c-.024-.012-.15-.067-.46-.067-.309 0-.441.055-.474.07-.015.009-.019.012-.019.013 0 0-.009.008-.023.03-.048.09-.096.203-.141.342.237-.03.46-.039.657-.039.188 0 .407.008.643.038zM8.625 10.35a.928.928 0 00-.296.194 1.156 1.156 0 00-.312.816v.528c0 .32.104.592.312.816a.928.928 0 00.296.194c.222.095.515.142.88.142.37 0 .663-.049.88-.147a.835.835 0 00.272-.189 1.11 1.11 0 00.336-.816v-.528c0-.32-.112-.592-.336-.816a.835.835 0 00-.272-.19c-.217-.097-.51-.146-.88-.146-.365 0-.658.047-.88.142zm1.524 4.652c-.237.03-.456.038-.644.038-.197 0-.42-.01-.657-.039.045.139.093.251.141.341.014.023.022.03.023.031 0 0 .004.005.02.012.032.016.164.071.473.071.31 0 .436-.055.46-.067l.005-.003a.212.212 0 00.017-.026l.007-.014.008-.014c.05-.086.1-.195.146-.33z"
            clipRule="evenodd"
        ></path>
    </>
)

export const CharPercent = () => (
    <>
        <path
            className="inner"
            d="M6.265 11.888c-1.2 0-2.128-.392-2.784-1.176-.656-.8-.984-1.896-.984-3.288s.328-2.48.984-3.264c.656-.8 1.584-1.2 2.784-1.2 1.2 0 2.128.4 2.784 1.2.656.784.984 1.872.984 3.264 0 1.392-.328 2.488-.984 3.288-.656.784-1.584 1.176-2.784 1.176zm0-2.088c.464 0 .784-.168.96-.504.192-.336.288-.784.288-1.344V6.896c0-.56-.096-1.008-.288-1.344-.176-.336-.496-.504-.96-.504-.464 0-.792.168-.984.504-.176.336-.264.784-.264 1.344v1.056c0 .56.088 1.008.264 1.344.192.336.52.504.984.504zm7.68-6.552h2.712l-3.624 7.2H10.32l3.624-7.2zM5.977 12.8h2.712L5.065 20H2.353l3.624-7.2zm6.792 7.488c-1.2 0-2.128-.392-2.784-1.176-.656-.8-.984-1.896-.984-3.288s.328-2.48.984-3.264c.656-.8 1.584-1.2 2.784-1.2 1.2 0 2.128.4 2.784 1.2.656.784.984 1.872.984 3.264 0 1.392-.328 2.488-.984 3.288-.656.784-1.584 1.176-2.784 1.176zm0-2.088c.464 0 .784-.168.96-.504.192-.336.288-.784.288-1.344v-1.056c0-.56-.096-1.008-.288-1.344-.176-.336-.496-.504-.96-.504-.464 0-.792.168-.984.504-.176.336-.264.784-.264 1.344v1.056c0 .56.088 1.008.264 1.344.192.336.52.504.984.504z"
        ></path>
        <path
            className="outer"
            fillRule="evenodd"
            d="M1.94 11.988l-.006-.008C.897 10.716.497 9.118.497 7.424c0-1.688.398-3.286 1.443-4.54C3.04 1.55 4.576.96 6.265.96s3.226.59 4.324 1.925c.293.35.535.729.731 1.128l1.392-2.765h7.19l-4.399 8.74c.593.31 1.13.738 1.59 1.297 1.046 1.254 1.444 2.851 1.444 4.539 0 1.694-.401 3.292-1.438 4.556l-.006.008-.006.007c-1.104 1.32-2.64 1.893-4.318 1.893-1.678 0-3.215-.573-4.318-1.893l-.007-.007-.006-.008a5.792 5.792 0 01-.74-1.163L6.297 22h-7.19l4.4-8.743a5.091 5.091 0 01-1.56-1.262l-.007-.007zm2.467-.519c.451.241.974.378 1.57.411.094.005.19.008.288.008.422 0 .81-.049 1.165-.146a3.21 3.21 0 001.259-.663 3.212 3.212 0 00.476-.517c.122-.165.231-.342.327-.531.36-.706.54-1.575.54-2.607 0-.27-.012-.53-.037-.778C9.893 5.62 9.577 4.79 9.05 4.16c-.656-.8-1.584-1.2-2.784-1.2-1.2 0-2.128.4-2.784 1.2-.656.784-.984 1.872-.984 3.264 0 1.392.328 2.488.984 3.288.264.316.573.569.926.757zm2.818-2.173c.192-.336.288-.784.288-1.344V6.896c0-.56-.096-1.008-.288-1.344-.176-.336-.496-.504-.96-.504-.464 0-.792.168-.984.504-.176.336-.264.784-.264 1.344v1.056c0 .56.088 1.008.264 1.344.192.336.52.504.984.504.464 0 .784-.168.96-.504zm3.36 2.697l-.003.002a3.057 3.057 0 00-.597.565 3.54 3.54 0 00-.443.67C9.18 13.926 9 14.791 9 15.823c0 .256.01.502.033.738.098 1.047.415 1.897.95 2.55.657.784 1.585 1.176 2.785 1.176 1.2 0 2.128-.392 2.784-1.176.656-.8.984-1.896.984-3.288s-.328-2.48-.984-3.264a3.124 3.124 0 00-.95-.785c-.451-.242-.975-.378-1.57-.408a5.082 5.082 0 00-.264-.007c-.434 0-.833.052-1.196.157a3.182 3.182 0 00-.988.476zm3.144 1.959c.192.336.288.784.288 1.344v1.056c0 .56-.096 1.008-.288 1.344-.176.336-.496.504-.96.504-.464 0-.792-.168-.984-.504-.176-.336-.264-.784-.264-1.344v-1.056c0-.56.088-1.008.264-1.344.192-.336.52-.504.984-.504.464 0 .784.168.96.504zm-.696-3.504l3.624-7.2h-2.712l-3.624 7.2h2.712zM5.977 12.8L2.353 20h2.712l3.624-7.2H5.977z"
            clipRule="evenodd"
        ></path>
    </>
)

export const CharDot = () => (
    <>
        <path
            className="inner"
            d="M8.42894 21.288C7.53294 21.288 6.88494 21.096 6.48494 20.712C6.10094 20.312 5.90894 19.84 5.90894 19.296V18.456C5.90894 17.912 6.10094 17.448 6.48494 17.064C6.88494 16.664 7.53294 16.464 8.42894 16.464C9.32494 16.464 9.96494 16.664 10.3489 17.064C10.7489 17.448 10.9489 17.912 10.9489 18.456V19.296C10.9489 19.84 10.7489 20.312 10.3489 20.712C9.96494 21.096 9.32494 21.288 8.42894 21.288Z"
        />
        <path
            className="outer"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.07043 22.1265L5.04216 22.0971C4.30829 21.3326 3.90894 20.3673 3.90894 19.296V18.456C3.90894 17.3826 4.31092 16.4096 5.07072 15.6498C6.01456 14.7059 7.30183 14.464 8.42894 14.464C9.53425 14.464 10.826 14.6968 11.7618 15.6481C12.5285 16.3974 12.9489 17.3687 12.9489 18.456V19.296C12.9489 20.3936 12.5215 21.3678 11.7631 22.1262C10.823 23.0663 9.52796 23.288 8.42894 23.288C7.31952 23.288 6.0449 23.062 5.09987 22.1548L5.07043 22.1265ZM10.3489 17.064C9.96494 16.664 9.32494 16.464 8.42894 16.464C7.53294 16.464 6.88494 16.664 6.48494 17.064C6.10094 17.448 5.90894 17.912 5.90894 18.456V19.296C5.90894 19.84 6.10094 20.312 6.48494 20.712C6.88494 21.096 7.53294 21.288 8.42894 21.288C9.32494 21.288 9.96494 21.096 10.3489 20.712C10.7489 20.312 10.9489 19.84 10.9489 19.296V18.456C10.9489 17.912 10.7489 17.448 10.3489 17.064Z"
        />
    </>
)

export const CharComma = () => (
    <>
        <path className="inner" d="M6.677 13.824h4.56l-3.288 7.8h-2.64z"></path>
        <path
            className="outer"
            fillRule="evenodd"
            d="M4.997 11.824h9.253l-4.974 11.8H2.928zm1.68 2h4.56l-3.288 7.8h-2.64z"
            clipRule="evenodd"
        ></path>
    </>
)
export const characters: { [key in string | number]: () => JSX.Element } = {
    1: Char1,
    2: Char2,
    3: Char3,
    4: Char4,
    5: Char5,
    6: Char6,
    7: Char7,
    8: Char8,
    9: Char9,
    0: Char0,
    '.': CharDot,
    '%': CharPercent,
    ',': CharComma
}
