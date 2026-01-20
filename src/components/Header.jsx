import Banner from '../assets/banners.jpg';

export const Header = () => {
  return (
    <header className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
      <img
        src={Banner}
        alt="Banner do site"
        className="w-full h-auto block"
      />
    </header>
  );
};
