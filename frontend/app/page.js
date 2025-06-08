import Navbar from "./components/navbar";

export default function Home() {
  return (
    <div className="">
      <Navbar></Navbar>
      <div className="" id="Main">
        <div className="flex justify-center pt-10">
          <input
            type="text"
            placeholder="Enter auction ID"
            className="bg-white w-full max-w-64 p-3 "
          />
          <button className="px-6 py-2 font-medium tracking-wide ml-16 text-white capitalize transition-colors duration-300 transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80">
            Join
          </button>
        </div>

      </div>
    </div>
  );
}
