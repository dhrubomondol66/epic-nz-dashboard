import logo from "../../assets/images/logo.png";


export default function LogoArea() {



  return (
    <>
      <div className="py-[13px] px-[11px] border-b border-[rgba(59,175,122,0.2)] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <a href="/dashboard">
              <div className="w-[130px] h-[29px] object-contain">
                <img src={logo} alt="logo" />
              </div>
            </a>
            <h4 className="text-[rgba(245,245,245,0.49)] font-inter text-[14px] font-normal leading-normal mt-1">
              Outdoor Admin
            </h4>
          </div>

         
        </div>
      </div>
    </>
  );
}