/**
 * @jest-environment jsdom
 */
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/dom";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import { ROUTES_PATH } from "../constants/routes";

jest.mock("../app/store", () => mockStore);
const file = new File(["facture"], "testFacture.png", { type: "image/png" });

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("then if I upload an image, the new file should be uploaded", () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      const fileInput = screen.getByTestId("file");
      userEvent.upload(fileInput, file);
      expect(fileInput.files[0]).toStrictEqual(file);;
      expect(fileInput.files).toHaveLength(1);
    });
  });


  describe("When I fill the bill's form and click on 'envoyer'", () => {
    test("the form is submitted", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();

      userEvent.click(screen.getByTestId("expense-type"));
      userEvent.click(screen.getByText("Transports"));
      userEvent.type(screen.getByTestId("expense-name"), "Vol Paris Londres");
      screen.getByTestId("datepicker").value = new Date();
      userEvent.type(screen.getByTestId("amount"), "100");
      userEvent.type(screen.getByTestId("vat"), "10");
      userEvent.type(screen.getByTestId("pct"), "1");
      userEvent.type(
        screen.getByTestId("commentary"),
        "Commentaire test"
      );
      userEvent.upload(screen.getByTestId("file"), file);
      userEvent.click(screen.getByText("Envoyer"));
      expect(await screen.findByText("Mes notes de frais")).toBeTruthy();
    });
  });
});
