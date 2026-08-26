(function(){
'use strict';
const style=document.createElement('style');
style.textContent=`
:focus-visible{outline:4px solid #f59e0b!important;outline-offset:3px!important}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}}
@media(prefers-contrast:more){button,a,.choice,.card,.game-card{border-width:3px!important}}
`;
document.head.appendChild(style);
})();
