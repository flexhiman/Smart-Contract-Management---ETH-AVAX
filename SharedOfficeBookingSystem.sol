// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract SharedOfficeBookingSystem {
    struct Office {
        uint officeId;
        string officeName;
        address owner;
        bool isBooked;
        uint pricePerHour;
    }

    struct Booking {
        uint officeId;
        uint startTime;
        uint bookingDuration;
        bool isReturned;
        uint totalCost;
    }

    mapping(uint => Office) public offices;
    mapping(address => mapping(uint => Booking)) public bookings; // User bookings
    mapping(address => uint) public earnings;  // Owner earnings
    uint public officeCount;

    event OfficeAdded(uint officeId, string officeName, address owner, uint pricePerHour);
    event OfficeBooked(address user, uint officeId, uint bookingDuration, uint totalCost);
    event OfficeReturned(address user, uint officeId, uint totalCost, bool lateFeeCharged);

    // Add a new office with a specific rental price per hour
    function addOffice(string memory officeName, uint pricePerHour) public {
        require(bytes(officeName).length > 0, "Office name cannot be empty");
        require(pricePerHour > 0, "Price per hour must be greater than zero");

        officeCount++;
        offices[officeCount] = Office(officeCount, officeName, msg.sender, false, pricePerHour);

        emit OfficeAdded(officeCount, officeName, msg.sender, pricePerHour);
    }

    // Book an office for a specified duration (in hours)
    function bookOffice(uint officeId, uint bookingDuration) public payable {
        Office storage office = offices[officeId];
        require(office.officeId != 0, "Office does not exist");
        require(!office.isBooked, "Office is already booked");
        require(bookingDuration > 0, "Booking duration must be greater than zero");

        uint totalCost = office.pricePerHour * bookingDuration;
        require(msg.value >= totalCost, "Insufficient payment for booking");

        office.isBooked = true;
        bookings[msg.sender][officeId] = Booking(officeId, block.timestamp, bookingDuration, false, totalCost);

        // Transfer payment to office owner
        earnings[office.owner] += totalCost;

        emit OfficeBooked(msg.sender, officeId, bookingDuration, totalCost);
    }

    // Return the office and check for late fees
    function returnOffice(uint officeId) public {
        Booking storage booking = bookings[msg.sender][officeId];
        Office storage office = offices[officeId];

        require(booking.officeId != 0, "Booking does not exist");
        require(!booking.isReturned, "Office has already been returned");

        // Calculate if the office is returned late
        uint endTime = booking.startTime + (booking.bookingDuration * 1 hours);
        bool isLate = block.timestamp > endTime;
        uint lateFee = 0;

        if (isLate) {
            uint lateHours = (block.timestamp - endTime) / 1 hours;
            lateFee = lateHours * office.pricePerHour;
            earnings[office.owner] += lateFee;
        }

        booking.isReturned = true;
        office.isBooked = false;

        emit OfficeReturned(msg.sender, officeId, booking.totalCost + lateFee, isLate);
    }

    // Allow office owners to withdraw their earnings
    function withdrawEarnings() public {
        uint balance = earnings[msg.sender];
        require(balance > 0, "No earnings available to withdraw");

        earnings[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
    }

    // View office details and availability
    function checkOfficeAvailability(uint officeId) public view returns (string memory officeName, bool isBooked, uint pricePerHour, address owner) {
        Office storage office = offices[officeId];
        require(office.officeId != 0, "Office does not exist");

        return (office.officeName, office.isBooked, office.pricePerHour, office.owner);
    }

    // Internal function to ensure office state consistency
    function internalCheck(uint officeId) internal view {
        Office storage office = offices[officeId];
        assert(office.officeId > 0);
        assert(office.isBooked == false || office.isBooked == true);
    }
}
